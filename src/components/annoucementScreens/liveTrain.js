import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TextComponent,
} from "react-native";
import React, { useState, useEffect } from "react";
// import qs from 'qs';
// import { Linking } from 'react-native';
import { getTrainSchedules } from "../Information/Railwayapi";
import { SafeAreaView } from "react-native";
import { ArrowPathIcon, MapPinIcon } from "react-native-heroicons/solid";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ArrowDownCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
} from "react-native-heroicons/outline";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PREDEFINED_LANGUAGE } from "../../constants/config";
// export async function sendEmail(to, subject, body, options = {}) {
//   const { cc, bcc } = options;

//   let url = `mailto:${to}`;

//   // Create email link query
//   const query = qs.stringify({
//     subject: subject,
//     body: body,
//     cc: cc,
//     bcc: bcc
//   });

//   if (query.length) {
//     url += `?${query}`;
//   }

//   // Check if we can use this link
//   const canOpen = await Linking.canOpenURL(url);

//   if (!canOpen) {
//     throw new Error('Provided URL can not be handled');
//   }

//   return Linking.openURL(url);
// }
import { getTranslation } from '../ASRComponents/NMTv2';
import Sound from "react-native-sound";
import fs, { stat } from "react-native-fs";
import { useSelector } from 'react-redux';
import { getAudio } from '../ASRComponents/TTS';
import SmsAndroid from 'react-native-get-sms-android';

export default function LiveTrain() {
  const [trainSchedule, setTrainSchedule] = useState(null);
  const [boarding, setBoarding] = useState();
  const currentLanguage = useSelector(state => state.language.currentLanguage);
  const [liveText, setLiveText] = useState("");

  const [lang, setLang] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("lang");
        if (storedLang != null) setLang(storedLang);
        else setLang("en");
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    fetchData();
  }, []);
  React.useEffect(() => {
    console.log("Language changed: ", lang);
  }, [lang]);
  React.useEffect(() => {
    const getData = async () => {
      // call getTrainSchedules
      const data = await getTrainSchedules(selectedTrain);
      const schedule = data.schedule;
      setselectedTrainSchedule();
    };
    getData();
  }, [selectedTrain]);

  // For Search Bar
  const [number, onChangeNumber] = React.useState("");
  // const handleEmailSending = () => {
  //   const to = 'gehlotbhopesh007@gmail.com';
  //   const subject = 'hello';
  //   const body = 'padharo sa';

  //   // You can include cc and bcc in options if needed
  //   const options = {};

  //   // Call the sendEmail function
  //   sendEmail(to, subject, body, options)
  //     .then(() => {
  //       console.log('Email sent successfully!');
  //     })
  //     .catch((error) => {
  //       console.error('Error sending email:', error);
  //     });
  // };

  return (
    <SafeAreaView>
      <View
        style={{ width: wp(100) }}
        className="flex-row items-center my-2 px-2 justify-around"
      >
        <TextInput
          className="rounded-lg"
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          placeholder={PREDEFINED_LANGUAGE["Enter_Mobile_number"][lang]}
          keyboardType="numeric"
        />

        {/*Location  */}
        <TouchableOpacity
          className="p-3 rounded-xl ml-2 bg-blue-500"
          onPress={async () => {
            getLongitude();
          }}
          mode="elevated"
          dark={true}
        >
          <MagnifyingGlassIcon size={20} color="#fff" />
        </TouchableOpacity>

        {/* Refresh */}
        <TouchableOpacity className="p-3 rounded-xl ml-2 bg-blue-500" onPress={() => {

        }} mode='elevated' dark={true}>
          <ArrowPathIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View className="flex-row">
        <ScrollView className="border-2 border-black h-44 m-4" style={{ width: '70%' }}><Text>{liveText}</Text></ScrollView>
        <View className="flex-row items-center justify-center mr-4">
          {/* <TouchableOpacity
            onPress={() => {}}
            className="rounded-3xl p-2 flex-row justify-center items-center bg-blue-600 w-12 h-12"
          >
            <SpeakerWaveIcon size={20} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>
      <View className="flex-row justify-between py-2 bg-blue-900">
        <Text className="text-white ml-3">
          {PREDEFINED_LANGUAGE["arrival"][lang]}
        </Text>
        <Text className="text-white">
          {PREDEFINED_LANGUAGE["station"][lang]}
        </Text>
        <Text className="text-white mr-6">
          {PREDEFINED_LANGUAGE["departure"][lang]}
        </Text>
      </View>

      {/* green */}
      {trainSchedule && <Green cardData={trainSchedule[0]} handleAnnouncement={handleAnnouncement} />}
      <ScrollView>
        {(trainSchedule) && trainSchedule.map((cardData, idx) => {
          if (idx > 0 && idx < trainSchedule.length - 1)
            return <Blue key={idx} cardData={cardData} handleAnnouncement={handleAnnouncement} />
        })}

      </ScrollView>
      {trainSchedule && <Red cardData={trainSchedule[trainSchedule.length - 1]} handleAnnouncement={handleAnnouncement} />}

    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  input: {
    height: 42,
    width: wp(70),
    borderWidth: 1,
    padding: 10,
  },
});

const Green = ({ cardData, handleAnnouncement}) => {
  const [lang, setLang] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('lang');
        if (storedLang != null)
          setLang(storedLang);
        else
          setLang('en')
      } catch (error) {
        console.error('Error: ', error);
      }
    }
    fetchData();
  }, [])
  return <View className="flex-col items-center" style={{ width: wp(100) }}>
    <TouchableOpacity pointerEvents='none' style={{ width: wp(100), height: wp(18) }} className="flex-row justify-between font-semibold bg-green-200 items-center px-3" >
      <View style={{ width: wp(24) }} className="flex-row items-center justify-between">
        <Text className="font-medium text-[16px]">
          {/* 07:01 */}
          {cardData.arrivalTime}
        </Text>
        <ChevronDoubleDownIcon size={30} className="font-thin" color="#16247d" />
      </View>
      <View className="flex-col justify-between align-center">
        <Text className="text-[#16247d] text-[16px] font-medium" >{cardData.stationName}</Text>
        <Text className="text-[14px] font-medium">{`(${cardData.stationCode})`}</Text>
        <Text>{PREDEFINED_LANGUAGE['PF'][lang]} : {cardData.platform}</Text>
      </View>
      <Text className="font-medium text-[16px]" >
        {cardData.departureTime}
      </Text>
      <TouchableOpacity className="rounded-3xl p-2 bg-green-600" onPress={handleAnnouncement}>
        <SpeakerWaveIcon size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  </View>
}

const Blue = ({ cardData, handleAnnouncement }) => {
  const [lang, setLang] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('lang');
        if (storedLang != null)
          setLang(storedLang);
        else
          setLang('en')
      } catch (error) {
        console.error('Error: ', error);
      }
    }
    fetchData();
  }, [])
  return <TouchableOpacity pointerEvents='none' style={{ width: wp(100), height: wp(18) }} className="flex-row justify-between font-semibold bg-blue-200 items-center px-3" >
    <View style={{ width: wp(24) }} className="flex-row items-center justify-between">
      <Text className="font-medium text-[16px]">
        {/* 07:02 */}
        {cardData.arrivalTime}
      </Text>
      <ChevronDoubleDownIcon size={30} className="font-thin" color="#16247d" />
    </View>
    <View className="flex-col justify-between align-center">
      {/* <Text className="text-[#16247d] text-[16px] font-medium" >Durg Junction</Text> */}
      <Text className="text-[#16247d] text-[16px] font-medium" >{cardData.stationName}</Text>
      {/* <Text className="text-[14px] font-medium">(DURG)</Text> */}
      <Text className="text-[14px] font-medium">{`(${cardData.stationCode})`}</Text>
      <Text>{PREDEFINED_LANGUAGE['PF'][lang]} : {cardData.platform}</Text>
    </View>
    <Text className="font-medium text-[16px]" >
      {/* 07:11 */}
      {cardData.departureTime}
    </Text>
    <TouchableOpacity className="rounded-3xl p-2 bg-blue-600">
      <SpeakerWaveIcon size={20} color="#fff" onPress={handleAnnouncement}/>
    </TouchableOpacity>
  </TouchableOpacity>
}

const Red = ({ cardData, handleAnnouncement }) => {
  const [lang, setLang] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('lang');
        if (storedLang != null)
          setLang(storedLang);
        else
          setLang('en')
      } catch (error) {
        console.error('Error: ', error);
      }
    }
    fetchData();
  }, [])
  return <View>
    <TouchableOpacity pointerEvents='none' style={{ width: wp(100), height: wp(18) }} className="flex-row justify-between font-semibold bg-red-200 items-center px-3" >
      <View style={{ width: wp(24) }} className="flex-row items-center justify-between">
        <Text className="font-medium text-[16px]">
          {cardData.arrivalTime}
        </Text>
        <ChevronDoubleDownIcon size={30} className="font-thin" color="#16247d" />
      </View>
      <View className="flex-col justify-between align-center">
        <Text className="text-[#16247d] text-[16px] font-medium" >{cardData.stationName}</Text>
        <Text className="text-[14px] font-medium">{`(${cardData.stationCode})`}</Text>
        <Text>{PREDEFINED_LANGUAGE['PF'][lang]} : {cardData.platform}</Text>
      </View>
      <Text className="font-medium text-[16px]" >
        {cardData.departureTime}
      </Text>
      <TouchableOpacity className="rounded-3xl p-2 bg-red-600">
        <SpeakerWaveIcon size={20} color="#fff" onPress={handleAnnouncement}/>
      </TouchableOpacity>
    </TouchableOpacity>
  </View>
}