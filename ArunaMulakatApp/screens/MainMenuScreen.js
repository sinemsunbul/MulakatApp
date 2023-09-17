import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { parseString } from 'react-native-xml2js';

const MainMenuScreen = ({ navigation }) => {
  const [userModules, setUserModules] = useState([]);
  const [apiAddress, setApiAddress] = useState('http://demo.arunayazilim.com/DeppoService/DeppoService.asmx');
  const [userId, setUserId] = useState(123);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcının yetkilerini almak için GetUserRights metodunu çağırın
    const soapMessage = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://aruna.com/">
        <soapenv:Header/>
        <soapenv:Body>
          <web:GetUserRights>
            <web:intUserId>${userId}</web:intUserId>
          </web:GetUserRights>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    axios
      .post(apiAddress, soapMessage, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'http://aruna.com/GetUserRights',
        },
      })
      .then((response) => {
        const responseData = response.data;
        parseSoapResponse(responseData, setUserModules);
        setLoading(false);
      })
      .catch((error) => {
        console.error('SOAP Error:', error);
        setLoading(false);
        Alert.alert('Hata', 'Kullanıcı yetkileri alınamadı. Lütfen tekrar deneyin.');
      });
  }, [apiAddress, userId]);

  const parseSoapResponse = (responseXML, stateSetter) => {
    parseString(responseXML, (err, result) => {
      if (!err && result && result['soap:Envelope']) {
        const moduleList = result['soap:Envelope']['soap:Body'][0]['GetUserRightsResponse'][0]['GetUserRightsResult'][0]['int'][0];
        if (moduleList && moduleList.length > 0) {
          const parsedModules = moduleList.map((module) => parseInt(module));
          stateSetter(parsedModules);
        }
      }
    });
  };

  const modules = [
    { id: 100, name: 'Mal Kabul', pageName: 'MalKabulPage' },
    { id: 200, name: 'Sevkiyat', pageName: 'SevkiyatPage' },
    { id: 300, name: 'Depo Fişleri', pageName: 'DepoFisleriPage' },
    { id: 400, name: 'Sayım', pageName: 'SayimPage' },
    { id: 500, name: 'Sipariş', pageName: 'SiparisPage' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Ana Menü</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        modules.map((module) => (
          <TouchableOpacity
            key={module.id}
            onPress={() => {
              if (userModules.includes(module.id)) {
                navigation.navigate(module.pageName);
              } else {
                alert('Bu modüle erişim izniniz yok.');
              }
            }}
            disabled={!userModules.includes(module.id)}
            style={[
              styles.moduleButton,
              { opacity: userModules.includes(module.id) ? 1 : 0.5 },
            ]}
          >
            <Text style={styles.moduleButtonText}>{module.name}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Arka plan rengi
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Başlık metin rengi
  },
  moduleButton: {
    width: 200,
    height: 50,
    backgroundColor: '#3498db', // Modül düğmesi arka plan rengi
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  moduleButtonText: {
    fontSize: 18,
    color: 'white', // Modül düğmesi metin rengi
    fontWeight: 'bold',
  },
});

export default MainMenuScreen;
