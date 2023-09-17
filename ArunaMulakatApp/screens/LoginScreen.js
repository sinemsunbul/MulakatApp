import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { parseString } from 'react-native-xml2js';

const LoginScreen = ({ navigation }) => {
  const [apiAddress, setApiAddress] = useState('http://demo.arunayazilim.com/DeppoService/DeppoService.asmx');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('apiAddress').then((address) => {
      if (address) {
        setApiAddress(address);
      }
    });
  }, []);

  useEffect(() => {
    
    const soapRequest = `
    <?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <soap:Body>
        <GetActiveCompanies xmlns="http://aruna.com/" />
      </soap:Body>
    </soap:Envelope>
  `;

   
    axios.post(apiAddress, soapRequest, {
      headers: {
        'Content-Type':'text/xml; charset=utf-8',
        SOAPAction: 'http://aruna.com/GetActiveCompanies',
      },
    })
    .then((response) => {
   
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(response.data, (err, result) => {
        if (!err) {
        
          //const companiesResponse = result['soap:Envelope']['soap:Body']['GetActiveCompaniesResponse'];
          const companiesResponse = result['soap:Envelope']['soap:Body'][0]['GetActiveCompaniesResponse'];
          console.log(companiesResponse);
        } else {
          console.error('XML Parse Error:', err);
        }
      });
    })
    .catch((error) => {
      console.error('SOAP Error:', error);
      alert('Şirketler alınamadı. Lütfen tekrar deneyin.');
    })
  }, [apiAddress]);

  useEffect(() => {
    if (selectedCompany) {
     
      const getEntitiesSoapMessage = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://aruna.com/">
          <soapenv:Header/>
          <soapenv:Body>
            <web:GetActiveEntities>
              <web:companyId>${selectedCompany}</web:companyId>
            </web:GetActiveEntities>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

      const getEntitiesSoapRequest = {
        method: 'POST',
        url: apiAddress,
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'http://aruna.com/GetActiveEntities',
        },
        data: getEntitiesSoapMessage,
      };

     
      axios(getEntitiesSoapRequest)
        .then((response) => {
          const responseData = response.data;
          parseSoapResponse(responseData, 'EntityName', setEntities);
        })
        .catch((error) => {
          console.error('SOAP Error:', error);
          alert('İşletmeler alınamadı. Lütfen tekrar deneyin.');
        });
    }
  }, [selectedCompany, apiAddress]);

  useEffect(() => {
    if (selectedCompany && selectedEntity) {
      
      const getActiveUsersInEntitySoapMessage = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://aruna.com/">
          <soapenv:Header/>
          <soapenv:Body>
            <web:GetActiveUsersInEntity>
              <web:companyId>${selectedCompany}</web:companyId>
              <web:entityId>${selectedEntity}</web:entityId>
            </web:GetActiveUsersInEntity>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

      const getActiveUsersInEntitySoapRequest = {
        method: 'POST',
        url: apiAddress,
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'http://aruna.com/GetActiveUsersInEntity',
        },
        data: getActiveUsersInEntitySoapMessage,
      };

     
      axios(getActiveUsersInEntitySoapRequest)
        .then((response) => {
          const responseData = response.data;
          parseSoapResponse(responseData, 'UserName', setUsers);
        })
        .catch((error) => {
          console.error('SOAP Error:', error);
          alert('Kullanıcılar alınamadı. Lütfen tekrar deneyin.');
        });
    }
  }, [selectedCompany, selectedEntity, apiAddress]);

  const parseSoapResponse = (responseXML, tagName, stateSetter) => {
    parseString(responseXML, (err, result) => {
      if (err) {
        console.error('XML Parse Error:', err);
        return;
      }
      const tagValue = result['soapenv:Envelope']['soapenv:Body'][0][`web:${tagName}`][0];
      stateSetter([tagValue]);
    });
  };

  const handleLogin = () => {
    if (!selectedCompany || !selectedEntity || !selectedUser) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    const password = '1'; 


    const soapMessage = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://aruna.com/">
        <soapenv:Header/>
        <soapenv:Body>
          <web:Login>
            <web:CompanyId>${selectedCompany}</web:CompanyId>
            <web:EntityId>${selectedEntity}</web:EntityId>
            <web:UserId>${selectedUser}</web:UserId>
            <web:Password>${password}</web:Password>
          </web:Login>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

   
    setLoading(true); 
    axios
      .post(apiAddress, soapMessage, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: 'http://aruna.com/Login',
        },
      })
      .then((response) => {
        const responseXML = response.data;
        parseSoapResponse(responseXML, 'LoginResult', handleLoginResult);
      })
      .catch((error) => {
        console.error('SOAP Error:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      });
  };

  const handleLoginResult = (loginResult) => {
    console.log('loginResult:', loginResult); 
    setLoading(false); 

    if (loginResult === 'Success') {
      navigation.navigate('MainMenuScreen');
    } else {
      alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hoş Geldiniz</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>API Adresi:</Text>
        <TextInput
          style={styles.input}
          placeholder="API Adresi"
          value={apiAddress}
          onChangeText={(text) => setApiAddress(text)}
        />

        <Text style={styles.label}>Şirket Adı:</Text>
        <DropDownPicker
          items={companies.map((company) => ({ label: company, value: company }))}
          defaultValue={selectedCompany}
          containerStyle={styles.dropdownContainer}
          onChangeItem={(item) => setSelectedCompany(item.value)}
        />

        <Text style={styles.label}>İşletme:</Text>
        <DropDownPicker
          items={entities.map((entity) => ({ label: entity, value: entity }))}
          defaultValue={selectedEntity}
          containerStyle={styles.dropdownContainer}
          onChangeItem={(item) => setSelectedEntity(item.value)}
        />

        <Text style={styles.label}>Kullanıcı Adı:</Text>
        <DropDownPicker
          items={users.map((user) => ({ label: user, value: user }))}
          defaultValue={selectedUser}
          containerStyle={styles.dropdownContainer}
          onChangeItem={(item) => setSelectedUser(item.value)}
        />

        <Text style={styles.label}>Parola:</Text>
        <TextInput
          style={styles.input}
          placeholder="Parola"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Giriş Yap" onPress={handleLogin} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    width: 300,
    padding: 20, 
    backgroundColor: 'white', 
    borderRadius: 10,
    elevation: 3, 
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  dropdownContainer: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
});
export default LoginScreen;
