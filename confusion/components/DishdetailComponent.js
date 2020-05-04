import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';

import {postComment, postFavorite } from '../redux/ActionCreators';
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
});

function RenderDish(props) {

    const dish = props.dish;

    if (dish != null) {
        return (
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
                    ></Icon>
                    <Icon
                        raised
                        reverse
                        name='pencil'
                        type='font-awesome'
                        color="#512DA8"
                        onPress={() => props.onPressComment()}
                    ></Icon>
                </View>

            </Card>
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
            <View key={index} style={{ margin: 10  } }>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating readonly style= {styles.dishRating} imageSize= {20}  startingValue={item.rating}></Rating>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    return (
        <Card title='Comments' >
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
            />
        </Card>
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

    handleNewComment() {
        console.log(JSON.stringify(this.state));
        this.props.postComment(this.props.navigation.getParam('dishId', ''),this.state.rating,this.state.author,this.state.comment);
        this.toggleModal();
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
                    onPressComment={() => this.toggleModal()}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal
                    animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}
                >
                    <View style={styles.modal}>
                        <Rating
                            showRating
                            onFinishRating={rat => this.setState({rating: rat})}
                            style={{ paddingVertical: 10 }}
                        />
                        <Input

                            onChangeText={text => this.setState({ author: text})}

                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o', color: 'black', marginRight: 10 }}
                        />
                        <Input
                            onChangeText={text => this.setState({ comment: text})}
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o', color: 'black', marginRight: 10 }}
                        />

                    </View>
                    <View style={styles.modalButton} >
                        <Button
                            onPress={() => { this.handleNewComment(); }}
                            color="#512DA8"
                            title="Submit"
                        />
                    </View>
                    <View style={styles.modalButton}>
                        <Button
                            onPress={() => { this.toggleModal(); }}
                            color="#808080"
                            title="Cancel"
                        />
                    </View>

                </Modal>
            </ScrollView>);
    }

}

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
    modalButton: {
        margin: 10
    },
    dishRating: {
        fontSize: 5,
        flexDirection: 'row'
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);