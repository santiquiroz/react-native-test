import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {Card} from 'react-native-elements';


function RenderContact() {
    return (
        <Card title="Contact Information">
            <Text>Our Address</Text>
            <Text>121, Clear Water Bay Road</Text>
            <Text>Clear Water Bay, Kowloon</Text>    
            <Text>HONG KONG</Text>    
            <Text>Tel: +852 1234 5678</Text>   
            <Text>Fax: +852 8765 4321</Text>    
            <Text>Email:confusion@food.net</Text>    
        </Card>
    );
}


class Contact extends Component {

    static navigationOptions = {
        title: 'Contact'
    };

    render() {
        return (
            <View>
                <RenderContact></RenderContact>
            </View>
        );
    }
}

export default Contact;