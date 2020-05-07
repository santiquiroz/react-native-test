import React, { Component } from 'react';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {
    const dish = props.dish;

    var viewRef;

    const handleViewRef = ref => viewRef = ref;

    const recognizeDragRight = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200)
            return true;

        else
            return false;
    }

    const recognizeDragLeft = ({ moveX, moveY, dx, dy }) => {
        if (dx < 200)
            return true;

        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },

        onPanResponderGrant: () => { viewRef.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled')); },

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDragRight(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                        { text: 'Cancel', onPress: () => { console.log('Cancel Pressed') }, style: 'cancel' },
                        { text: 'OK', onPress: () => { props.favorite ? console.log('Already favorite') : props.markFavorite() } },
                    ],
                    { cancelable: false }
                );

            else if (recognizeDragLeft(gestureState)) {
                props.onPressComment()
            }

            return true;
        }
    })

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },
            {
                dialogTitle: 'Share ' + title
            })
    }

    if (dish != null) {
        return (
            <Animatable.View
                animation="fadeInDown" duration={2000} delay={1000}
                ref={handleViewRef}
                {...panResponder.panHandlers}
            >
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}>
                    <Text style={{ margin: 10 }}>
                        {dish.description}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPressFavorite()}
                        />

                        <Icon
                            raised
                            reverse
                            name={'pencil'}
                            type='font-awesome'
                            color='#512DA8'
                            onPress={() => props.onPressComment()}
                        />

                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return (<View></View>);
    }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {

        return (
            <View key={index} style={{ margin: 15 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating readonly imageSize={20} startingValue={item.rating} style={{ flexDirection: 'row' }}> </Rating>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            favorites: [],
            showModal: false,
            rating: null,
            author: '',
            comment: ''
        };
    }


    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    handleComment() {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
        this.props.postComment(this.props.navigation.getParam('dishId', ''), this.state.rating, this.state.author, this.state.comment);
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPressFavorite={() => this.markFavorite(dishId)}
                    onPressComment={() => this.toggleModal(dishId)}
                    markFavorite={() => this.markFavorite(dishId)}
                />

                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />

                <Modal
                    animationType={"fade"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}
                >
                    <View style={styles.modal}>

                        <Rating
                            showRating
                            onFinishRating={star => this.setState({ rating: star })}
                            style={{ paddingVertical: 10 }}
                        />

                        <Input
                            onChangeText={text => this.setState({ author: text })}
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o', marginRight: 10 }}
                        />

                        <Input
                            onChangeText={text => this.setState({ comment: text })}
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'commenting-o', marginRight: 10 }}
                        />
                    </View>

                    <View style={styles.buttonView}>
                        <Button
                            onPress={() => { this.handleComment() }}
                            color="#512DA8"
                            title="Submit"
                        />
                    </View>

                    <View style={styles.buttonView}>
                        <Button
                            onPress={() => { this.toggleModal(); }}
                            color="#808080"
                            title="Cancel"
                        />
                    </View>
                </Modal>
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
    },

    buttonView: {
        margin: 10
    }

});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);