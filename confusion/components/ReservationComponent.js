import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Picker, Switch, Alert, Button, Modal } from 'react-native';
import DatePicker from 'react-native-datepicker';

import * as Animatable from 'react-native-animatable';

import * as Permissions from 'expo-permissions';

import * as Calendar from 'expo-calendar';

import { Notifications } from 'expo';

class Reservation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Reserve Table',
    };

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    handleReservation() {
        this.presentLocalNotification(this.state.date);
        //this.toggleModal();
        this.addReservationToCalendar(this.state.date);
    }

    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        });
    }

    showAlert() {
        Alert.alert(
            'Your Reservation is OK?',
            'Number of Guest: ' + this.state.guests + '\n' + 'Smoking? ' + this.state.smoking + '\n' +
            'Date and Time: ' + this.state.date,

            [
                { text: 'Cancel', onPress: () => { console.log('Cancel Pressed'); this.resetForm() }, style: 'cancel' },
                { text: 'OK', onPress: () => { console.log('Ok Pressed'); this.handleReservation(); this.resetForm() } },
            ],
            { cancelable: false }
        );
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to show notifications');
            }
        }
        return permission;
    }

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission();

        Notifications.presentLocalNotificationAsync({
            title: 'Your Reservation',
            body: 'Reservation for ' + date + ' requested',
            ios: {
                sound: true
            },
            android: {
                sound: true,
                vibrate: true,
                color: '#512DA8'
            }
        });
    }

    async obtainCalendarPermission() {
        let permission = await Permissions.getAsync(Permissions.CALENDAR);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.CALENDAR);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to use calendar');
            }
        }
        return permission;
    }

    async getDefaultCalendarSource() {
        const calendars = await Calendar.getCalendarsAsync();
        const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
        return defaultCalendars[0].source;
    }

    async getTheFuckingOSCalendar() {
        const defaultCalendarSource =
            Platform.OS === 'ios'
                ? await getDefaultCalendarSource()
                : { isLocalAccount: true, name: 'Expo Calendar' };
        const newCalendarID = await Calendar.createCalendarAsync({
            title: 'Expo Calendar',
            color: 'blue',
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'internalCalendarName',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        console.log(`Your new calendar ID is: ${newCalendarID}`);
        return newCalendarID;
    }

    async ahoraSHI(calendarId,date){

        const finalDate = date.setHours(date.getHours() + 2);
        const eventId = await Calendar.createEventAsync(null,
            {   

                title: 'Con Fusion Table Reservation',
                color: 'blue',
                sourceId: 'arbitraryString',
                timeZone: 'Europe/Stockholm',
                source: {
                    isLocalAccount: true,
                    name: 'arbitraryString'
                },
                startDate: date,
                endDate: finalDate,
                name: 'arbitraryString',
                ownerAccount: 'arbitraryString',
                accessLevel: [
                    Calendar.CalendarAccessLevel.CONTRIBUTOR,
                    Calendar.CalendarAccessLevel.EDITOR,
                    Calendar.CalendarAccessLevel.FREEBUSY,
                    Calendar.CalendarAccessLevel.OVERRIDE,
                    Calendar.CalendarAccessLevel.OWNER,
                    Calendar.CalendarAccessLevel.READ,
                    Calendar.CalendarAccessLevel.RESPOND,
                    Calendar.CalendarAccessLevel.ROOT
                ]
            }
        ).then((res) => {
            console.log('creo el puto calendario');
            console.log('res ==> ', res);
        }).catch(err => console.log('error ==> ', err))
        console.log(`Your new event ID is: ${eventId}`);
        console.log('event ==> ', eventId);
        return eventId;
    }

    async addReservationToCalendar(date) {


        console.log("puta vida---------------------------------------------------------------------------------");
        //Calendar.getCalendarsAsync().then(calendars => console.log(calendars,'calenders'));

        let permiso = await this.obtainCalendarPermission();
        if (permiso.status == 'granted') {

            let calendarId = await this.getTheFuckingOSCalendar(); 
            console.log(`Your new calendar ID is: ${calendarId}`);
            let eventId = await this.ahoraSHI(calendarId,date);
            Calendar.openEventInCalendar(eventId);
            
        }
        else {
            console.log("el puto calendario no tiene permisos");
        }



    }

    render() {
        return (
            <ScrollView>
                <Animatable.View animation="zoomIn" duration={2000}>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Number of Guests</Text>
                        <Picker
                            style={styles.formItem}
                            selectedValue={this.state.guests}
                            onValueChange={(itemValue) => this.setState({ guests: itemValue })}>
                            <Picker.Item label="1" value="1" />
                            <Picker.Item label="2" value="2" />
                            <Picker.Item label="3" value="3" />
                            <Picker.Item label="4" value="4" />
                            <Picker.Item label="5" value="5" />
                            <Picker.Item label="6" value="6" />
                        </Picker>
                    </View>

                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
                        <Switch
                            style={styles.formItem}
                            value={this.state.smoking}
                            onTintColor='#512DA8'
                            onValueChange={(value) => this.setState({ smoking: value })}>
                        </Switch>
                    </View>

                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Date and Time</Text>
                        <DatePicker
                            style={{ flex: 2, marginRight: 20 }}
                            date={this.state.date}
                            format=''
                            mode="datetime"
                            placeholder="select date and Time"
                            minDate="2017-01-01"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateIcon: {
                                    position: 'absolute',
                                    left: 0,
                                    top: 4,
                                    marginLeft: 0
                                },
                                dateInput: {
                                    marginLeft: 36
                                }
                            }}
                            onDateChange={(date) => { this.setState({ date: date }) }}
                        />
                    </View>

                    <View style={styles.formRow}>
                        <Button
                            //onPress={() => this.handleReservation()}
                            onPress={() => this.showAlert()}
                            title="Reserve"
                            color="#512DA8"
                            accessibilityLabel="Learn more about this purple button"
                        />
                    </View>

                    <Modal
                        animationType={"slide"} transparent={false}
                        visible={this.state.showModal}
                        onDismiss={() => this.toggleModal()}
                        onRequestClose={() => this.toggleModal()}
                    >
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Your Reservation</Text>
                            <Text style={styles.modalText}>Number of Guests: {this.state.guests}</Text>
                            <Text style={styles.modalText}>Smoking?: {this.state.smoking ? 'Yes' : 'No'}</Text>
                            <Text style={styles.modalText}>Date and Time: {this.state.date}</Text>

                            <Button
                                onPress={() => { this.toggleModal(); this.resetForm(); }}
                                color="#512DA8"
                                title="Close"
                            />
                        </View>
                    </Modal>
                </Animatable.View>

            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },

    formLabel: {
        fontSize: 18,
        flex: 2
    },

    formItem: {
        flex: 1
    },

    modal: {
        justifyContent: 'center',
        margin: 20
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },

    modalText: {
        fontSize: 18,
        margin: 10
    }
});

export default Reservation;