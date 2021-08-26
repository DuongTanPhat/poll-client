import React, { Component } from 'react';
import { createPoll, getListUser, getListGroup,deleteImage } from '../util/APIUtils';
import { MAX_CHOICES, POLL_QUESTION_MAX_LENGTH, POLL_CHOICE_MAX_LENGTH,USER_MAX_LENGTH,GROUP_MAX_LENGTH } from '../constants';
import './NewPost.css';
import { Avatar, Form, Input, Button, Select, Col, notification, Switch, InputNumber, Row } from 'antd';
import { Mentions, Upload } from 'antd';
import {
    CloseOutlined, UploadOutlined,PlusOutlined
} from '@ant-design/icons';
import { API_BASE_URL,  ACCESS_TOKEN } from '../constants';
import moment from 'moment';
import { DatePicker, Space } from 'antd';
import { getAvatarColor } from '../util/Colors';
const Option = Select.Option;
const { getMentions } = Mentions;
const FormItem = Form.Item;
const { TextArea } = Input

class NewPoll extends Component {
    constructor(props) {
        super(props);
        this.state = {

            question: {
                text: ''
            },
            polls: [{
                question: {
                    text: ''
                },
                choices: [{
                    text: '',
                    photo: null,
                    review: null
                }, {
                    text: '',
                    photo: null,
                    review: null
                }],
                pollLength: {
                    days: 1,
                    hours: 0
                },
                photo: '',
                isUnseenUserForVote: false,
                isUnseenUserForAddChoice: false,
                isAddChoice: false,
                isCanFix: true,
                showResultCase: 1,
                maxVotePerTimeLoad: 1,
                maxVotePerChoice: 1,
                maxVoteOfPoll: 1,
                timeLoad: {
                    days: 0,
                    hours: 0
                },
                isHasPollLength: true
            }],
            isUnseenOwner: false,
            showCase: 3,
            publicDateMoment: '',
            publicDate: '',
            isDelay: false,
            users: [],
            groups: [],
            usersSend: [],
            groupsSend: [],
            search: '',
            loading: false
        };
        // this.addChoice = this.addChoice.bind(this);
        // this.addPoll = this.addPoll.bind(this);
        // this.removeChoice = this.removeChoice.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        // this.handleQuestionChange = this.handleQuestionChange.bind(this);
        // this.handleChoiceChange = this.handleChoiceChange.bind(this);
        // this.handlePollDaysChange = this.handlePollDaysChange.bind(this);
        // this.handlePollHoursChange = this.handlePollHoursChange.bind(this);
        // this.handleTimeLoadDaysChange = this.handleTimeLoadDaysChange.bind(this);
        // this.handleTimeLoadHoursChange = this.handleTimeLoadHoursChange.bind(this);
        // this.handleQuestionForPostChange = this.handleQuestionForPostChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
        // this.handleShowResultCaseChange = this.handleShowResultCaseChange.bind(this);
        // this.handleShowCaseChange = this.handleShowCaseChange.bind(this);
        // this.loadUserList = this.loadUserList.bind(this);
        this.handlePublicDateChange = this.handlePublicDateChange.bind(this);
        // this.onSelect = this.onSelect.bind(this);
        // this.onSelectGroup = this.onSelectGroup.bind(this);
        // this.loadGroupList = this.loadGroupList.bind(this);
    }

    handlePublicDateChange(dateString) {
        //console.log(dateString.format("DD-MM-YYYY HH:mm:ss"));
        this.setState({
            publicDateMoment: dateString
        })
    }
    range = (start, end) => {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }
    disabledDate = (current) => {
        // Can not select days before today and today
        return current < moment().endOf('day');
    }
    disabledDateTime = () => {
        // if(current.get('day')===moment().get('day')){


        // return {
        //     disabledHours: () => this.range(0, 4),
        //     disabledMinutes: () => this.range(30, 60),
        //     disabledSeconds: () => [55, 56],
        // };}
        // else {
        return {
            disabledHours: () => this.range(0, 0),
            disabledMinutes: () => this.range(0, 0),
            disabledSeconds: () => this.range(0, 0),
        };
        //}
    }
    addChoice = (event, indexPoll)=> {
        const polls = this.state.polls.slice();
        const choices = polls[indexPoll].choices.slice();
        polls[indexPoll].choices = choices.concat([{
            text: '',
            photo: null,
            review: null
        }])
        this.setState({
            polls: polls
        });
    }
    addPoll = (event)=> {
        const polls = this.state.polls.slice();

        this.setState({
            polls: polls.concat([{
                question: {
                    text: ''
                },
                choices: [{
                    text: '',
                    photo: null,
                    review: null
                }, {
                    text: '',
                    photo: null,
                    review: null
                }],
                pollLength: {
                    days: 1,
                    hours: 0
                },
                photo: '',
                isUnseenUserForVote: false,
                isUnseenUserForAddChoice: false,
                isAddChoice: false,
                isCanFix: true,
                showResultCase: 1,
                maxVotePerTimeLoad: 1,
                maxVotePerChoice: 1,
                maxVoteOfPoll: 1,
                timeLoad: {
                    days: 0,
                    hours: 0
                },
                isHasPollLength: true
            }])
        });
    }
    removeChoice=(choiceNumber, pollNumber)=> {
        const polls = this.state.polls.slice();
        const choices = polls[pollNumber].choices.slice();
        //choices = [...choices.slice(0, choiceNumber), ...choices.slice(choiceNumber + 1)]
        polls[pollNumber].choices = [...choices.slice(0, choiceNumber), ...choices.slice(choiceNumber + 1)];
        this.setState({
            polls: polls
        });
    }
    removePoll=(pollNumber)=> {
        const polls = this.state.polls.slice();
        //choices = [...choices.slice(0, choiceNumber), ...choices.slice(choiceNumber + 1)]
        this.setState({
            polls:  [...polls.slice(0, pollNumber), ...polls.slice(pollNumber + 1)]
        });
    }
    onSearch = search => {
        this.setState({ search, loading: !!search });
        //console.log('Search:', search);
        this.loadUserList(search);
    }
    onSearchGroup = search => {
        this.setState({ search, loading: !!search });
        //console.log('Search:', search);
        this.loadGroupList(search);
    }
    loadUserList = (key) => {
        let promise;
        promise = getListUser(key, "username");

        if (!promise) {
            return;
        }
        promise
            .then(response => {
                let users = response.filter((user) => {
                    var check = true;
                    this.state.usersSend.forEach((userSend) => {
                        if (user.username === userSend) {
                            check = false;
                        }
                    })
                    return check;
                })
                this.setState({
                    users: users,
                    loading: false,
                })



            }).catch(error => {
                // this.setState({
                //     users: response
                // })
            });

    }
    loadGroupList = (key) => {
        let promise;
        promise = getListGroup(key);

        if (!promise) {
            return;
        }
        promise
            .then(response => {
                let groups = response.filter((group) => {
                    var check = true;
                    this.state.groupsSend.forEach((groupSend) => {
                        if (group.code === groupSend) {
                            check = false;
                        }
                    })
                    return check;
                })
                this.setState({
                    groups: groups,
                    loading: false,
                })



            }).catch(error => {
                // this.setState({
                //     users: response
                // })
            });

    }
    handleSubmit() {
        const pollData = {
            question: this.state.question.text,
            polls: this.state.polls.map(poll => {
                if(poll.isHasPollLength){
                    return {
                        question: poll.question.text,
                        choices: poll.choices.map(choice => {
                            return {
                                text: choice.text,
                                photo: choice.photo,
                                review: choice.review
                            }
                        }),
                        photo: poll.photo,
                        pollLength: poll.pollLength,
                        isUnseenUserForVote: poll.isUnseenUserForVote,
                        isUnseenUserForAddChoice: poll.isUnseenUserForAddChoice,
                        isAddChoice: poll.isAddChoice,
                        isCanFix: poll.isCanFix,
                        showResultCase: poll.showResultCase,
                        maxVotePerTimeLoad: poll.maxVotePerTimeLoad,
                        maxVotePerChoice: poll.maxVotePerChoice,
                        maxVoteOfPoll: poll.maxVoteOfPoll,
                        timeLoad: poll.timeLoad
                    }
                }
                else{
                    return {
                        question: poll.question.text,
                        choices: poll.choices.map(choice => {
                            return {
                                text: choice.text,
                                photo: choice.photo,
                                review: choice.review
                            }
                        }),
                        photo: poll.photo,
                        isUnseenUserForVote: poll.isUnseenUserForVote,
                        isUnseenUserForAddChoice: poll.isUnseenUserForAddChoice,
                        isAddChoice: poll.isAddChoice,
                        isCanFix: poll.isCanFix,
                        showResultCase: poll.showResultCase,
                        maxVotePerTimeLoad: poll.maxVotePerTimeLoad,
                        maxVotePerChoice: poll.maxVotePerChoice,
                        maxVoteOfPoll: poll.maxVoteOfPoll,
                        timeLoad: poll.timeLoad
                    }
                }
            })
            ,
            isUnseenOwner: this.state.isUnseenOwner,
            showCase: this.state.showCase,
            publicDate: null,
            usersUsername: this.state.usersSend,
            groups: this.state.groupsSend
        };
        if (this.state.isDelay) {
            if (this.state.publicDateMoment !== '') {
                pollData.publicDate = this.state.publicDateMoment.format("DD-MM-YYYY HH:mm:ss")
            }

        }
        //console.log(pollData);
        createPoll(pollData)
            .then(response => {
                this.props.history.push("/");
            }).catch(error => {
                if (error.status === 401) {
                    this.props.handleLogout('/login', 'error', 'You have been logged out. Please login create poll.');
                } else {
                    notification.error({
                        message: 'Polling App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });
                }
            });
    }

    validateQuestion = (questionText) => {
        if (questionText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your question!'
            }
        } else if (questionText.length > POLL_QUESTION_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Question is too long (Maximum ${POLL_QUESTION_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleQuestionChange = (event, index) => {
        const value = event.target.value;
        const polls = this.state.polls.slice();
        const pollitem = Object.assign(this.state.polls[index], {
            question: {
                text: value,
                ...this.validateQuestion(value)
            }
        });
        polls[index] = pollitem
        this.setState({
            polls: polls
        });
    }

    validateChoice = (choiceText) => {
        if (choiceText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter a choice!'
            }
        } else if (choiceText.length > POLL_CHOICE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Choice is too long (Maximum ${POLL_CHOICE_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleChoiceChange = (event, indexChoice, indexPoll) => {
        const polls = this.state.polls.slice();
        const value = event.target.value;
        const choiceitem = Object.assign(this.state.polls[indexPoll].choices[indexChoice], {
            text: value,
            ...this.validateChoice(value)
        });

        polls[indexPoll].choices[indexChoice] = choiceitem
        this.setState({
            polls: polls
        });
    }


    handlePollDaysChange=(value, indexPoll)=> {
        const polls = this.state.polls.slice();
        const pollLength = Object.assign(polls[indexPoll].pollLength, { days: value });
        polls[indexPoll].pollLength = pollLength;
        this.setState({
            polls: polls
        });
    }

    handlePollHoursChange = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        const pollLength = Object.assign(polls[indexPoll].pollLength, { hours: value });
        polls[indexPoll].pollLength = pollLength;
        this.setState({
            polls: polls
        });
    }

    handleTimeLoadDaysChange = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        const timeLoad = Object.assign(polls[indexPoll].timeLoad, { days: value });
        polls[indexPoll].timeLoad = timeLoad;
        this.setState({
            polls: polls
        });
    }

    handleTimeLoadHoursChange = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        const timeLoad = Object.assign(polls[indexPoll].timeLoad, { hours: value });
        polls[indexPoll].timeLoad = timeLoad;
        this.setState({
            polls: polls
        });
    }

    isFormInvalid() {
        if (this.state.question.validateStatus !== 'success') {
            return true;
        }
        if (this.state.showCase===5&&this.state.validateStatusGroup !== 'success'){
            return true;
        }
        if (this.state.showCase===4&&this.state.validateStatusUser !== 'success'){
            return true;
        }
        for (let i = 0; i < this.state.polls.length; i++) {
            const poll = this.state.polls[i];
            if (poll.question.validateStatus !== 'success') {
                return true;
            }
            for (let j = 0; j < poll.choices.length; j++) {
                const choice = poll.choices[j];
                if (choice.validateStatus !== 'success') {
                    return true;
                }
            }
        }
    }
    onChangeIsUnseenUserForVote = (indexPoll) => {
        const polls = this.state.polls.slice();
        const isUnseenUserForVote = polls[indexPoll].isUnseenUserForVote;
        polls[indexPoll].isUnseenUserForVote = !isUnseenUserForVote;
        this.setState({
            polls: polls
        });
    }
    onChangeIsUnseenUserForAddChoice = (indexPoll) => {
        const polls = this.state.polls.slice();
        const isUnseenUserForAddChoice = polls[indexPoll].isUnseenUserForAddChoice;
        polls[indexPoll].isUnseenUserForAddChoice = !isUnseenUserForAddChoice;
        this.setState({
            polls: polls
        });
    }
    onChangeIsAddChoice = (indexPoll) => {
        const polls = this.state.polls.slice();
        const isAddChoice = polls[indexPoll].isAddChoice;
        polls[indexPoll].isAddChoice = !isAddChoice;
        this.setState({
            polls: polls
        });
    }
    onChangeIsCanFix = (indexPoll) => {
        const polls = this.state.polls.slice();
        const isCanFix = polls[indexPoll].isCanFix;
        polls[indexPoll].isCanFix = !isCanFix;
        this.setState({
            polls: polls
        });
    }
    onChangeIsHasPollLength = (indexPoll) => {
        const polls = this.state.polls.slice();
        const isHasPollLength = polls[indexPoll].isHasPollLength;
        polls[indexPoll].isHasPollLength = !isHasPollLength;
        this.setState({
            polls: polls
        });
    }
    onChangeIsUnseenOwner = () => {
        this.setState({
            isUnseenOwner: !this.state.isUnseenOwner
        })
    }
    onChangeIsDelay = () => {
        this.setState({
            isDelay: !this.state.isDelay
        })
    }
    handleChangemaxVoteOfPoll = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        polls[indexPoll].maxVoteOfPoll = value;
        this.setState({
            polls: polls
        });
    }
    handleChangemaxVotePerChoice = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        polls[indexPoll].maxVotePerChoice = value;
        this.setState({
            polls: polls
        });
    }
    handleChangemaxVotePerTimeLoad = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        polls[indexPoll].maxVotePerTimeLoad = value;
        if (polls[indexPoll].maxVoteOfPoll < value) { polls[indexPoll].maxVoteOfPoll = value };
        this.setState({
            polls: polls
        });
    }
    handleQuestionForPostChange = (event) =>{
        const value = event.target.value;
        this.setState({
            question: {
                text: value,
                ...this.validateQuestion(value)
            }
        });
    }
    handleShowResultCaseChange = (value, indexPoll) => {
        const polls = this.state.polls.slice();
        const pollitem = Object.assign(polls[indexPoll], { showResultCase: value });
        polls[indexPoll] = pollitem;
        this.setState({
            polls: polls
        });
    }
    handleShowCaseChange = (value) => {
        this.setState({
            showCase: value
        })
    }
    onSelect = (value)=> {
        const mentions = getMentions(value);
        //console.log(mentions)
        const usersSend = [];
        mentions.forEach((mention) => {
            usersSend.push(mention.value);
        })
        this.setState({
            usersSend: usersSend,
            ...this.validateUsers(usersSend)
        })
        //console.log(this.state.usersSend);
    }
    onSelectGroup =(value)=> {
        const mentions = getMentions(value);
        //console.log(mentions)
        const groupsSend = [];
        mentions.forEach((mention) => {
            groupsSend.push(mention.value)
        })
        this.setState({
            groupsSend: groupsSend,
            ...this.validateGroups(groupsSend)
        })
        //console.log(this.state.usersSend);
    }
    validateGroups = (mentions) =>{
        //console.log(mentions.length)
        if (mentions.length === 0) {
            return {
                validateStatusGroup: 'error',
                errorMsgGroup: 'Please enter a group code!'
            }
        } else if (mentions.length > GROUP_MAX_LENGTH) {
            return {
                validateStatusGroup: 'error',
                errorMsgGroup: `Group is too much (Maximum ${GROUP_MAX_LENGTH} group allowed)`
            }
        } else {
            return {
                validateStatusGroup: 'success',
                errorMsgGroup: null
            }
        }
    }
    validateUsers = (mentions) =>{
        //console.log(mentions.length)
        if (mentions.length === 0) {
            return {
                validateStatusUser: 'error',
                errorMsgUser: 'Please enter a username!'
            }
        } else if (mentions.length > USER_MAX_LENGTH) {
            return {
                validateStatusUser: 'error',
                errorMsgUser: `User is too much (Maximum ${USER_MAX_LENGTH} user allowed)`
            }
        } else {
            return {
                validateStatusUser: 'success',
                errorMsgUser: null
            }
        }
    }
    componentDidMount() {
        this.loadUserList("");
        this.loadGroupList("");
    }
    onChangeUpload = (info, indexPoll) => {
        if (info.file.status !== "uploading") {
            //console.log(info);
            //console.log(this.state.polls);

        }
        if (info.fileList.length === 0) {
            const polls = this.state.polls.slice();
            deleteImage(polls[indexPoll].photo);
            polls[indexPoll].photo = null;
            this.setState({
                polls: polls
            });
        }
        if (info.file.status === "done") {
            const polls = this.state.polls.slice();
            //const isAddChoice = polls[indexPoll].isAddChoice;

            //polls[indexPoll].photo = info.fileList[0].response.fileDownloadUri;
            console.log(info.fileList[0].response);
            polls[indexPoll].photo = info.fileList[0].response.id;
            this.setState({
                polls: polls
            });

            notification.success({
                message: 'Polling App',
                description: `${info.file.name} file uploaded successfully`,
            });
            // message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
            console.log(info);
            if(info.file.response!=null){
                notification.error({
                    message: 'Polling App',
                    description: `${info.file.response.message}`,
                });
            }else{
                notification.error({
                    message: 'Polling App',
                    description: `${info.file.name} file upload failed. Max file size is 20MB`,
                });
            }
            
            //   message.error(`${info.file.name} file upload failed.`);
        }
    }
    onChangeUploadChoice = (info,indexChoice, indexPoll) => {
        if (info.file.status !== "uploading") {
            //console.log(info);
            //console.log(this.state.polls);

        }
        if (info.fileList.length === 0) {
            const polls = this.state.polls.slice();
            deleteImage(polls[indexPoll].choices[indexChoice].photo);
            const choiceitem = Object.assign(polls[indexPoll].choices[indexChoice], {
                photo: null
            });
            polls[indexPoll].choices[indexChoice] = choiceitem
            this.setState({
                polls: polls
            });
        }
        if (info.file.status === "done") {
            const polls = this.state.polls.slice();
            const choiceitem = Object.assign(this.state.polls[indexPoll].choices[indexChoice], {
                photo: info.fileList[0].response.id
            });

        polls[indexPoll].choices[indexChoice] = choiceitem
        this.setState({
            polls: polls
        });

            notification.success({
                message: 'Polling App',
                description: `${info.file.name} file uploaded successfully`,
            });
            // message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
            if(info.file.response!=null){
                notification.error({
                    message: 'Polling App',
                    description: `${info.file.response.message}`,
                });
            }else{
                notification.error({
                    message: 'Polling App',
                    description: `${info.file.name} file upload failed. Max file size is 20MB`,
                });
            }
            //   message.error(`${info.file.name} file upload failed.`);
        }
    }
    handleChoiceChangeReview = (event, indexChoice, indexPoll)=> {
        const polls = this.state.polls.slice();
        const value = event.target.value;
        const choiceitem = Object.assign(this.state.polls[indexPoll].choices[indexChoice], {
            review: value,
            ...this.validateChoice(this.state.polls[indexPoll].choices[indexChoice].text)
        });

        polls[indexPoll].choices[indexChoice] = choiceitem
        this.setState({
            polls: polls
        });
    }
    render() {
        //console.log(this.state.polls);
        const childrenUser = [];
        this.state.users.forEach((user, index) => {
            childrenUser.push(<Option key={index} value={user.id}><Avatar className="poll-creator-avatar"
                style={{ backgroundColor: getAvatarColor(user.name) }} >
                {user.name[0].toUpperCase()}
            </Avatar>
                <span className="poll-creator-name">
                    {user.name}
                </span></Option>);
        })


        const pollViews = [];

        this.state.polls.forEach((poll, index) => {
            const choiceViews = [];
            poll.choices.forEach((choice, index2) => {
                choiceViews.push(<PollChoice key={index2} choice={choice} choiceNumber={index2} pollNumber={index} removeChoice={this.removeChoice} handleChoiceChange={this.handleChoiceChange} handleChoiceChangeReview={this.handleChoiceChangeReview} onChangeUploadChoice={this.onChangeUploadChoice}/>);
            });
            pollViews.push(<PollCreate key={index} poll={poll} choiceViews={choiceViews} pollNumber={index} handleQuestionChange={this.handleQuestionChange}
                addChoice={this.addChoice} handlePollDaysChange={this.handlePollDaysChange} handlePollHoursChange={this.handlePollHoursChange}
                onChangeIsUnseenUserForVote={this.onChangeIsUnseenUserForVote} onChangeIsUnseenUserForAddChoice={this.onChangeIsUnseenUserForAddChoice}
                onChangeIsAddChoice={this.onChangeIsAddChoice} onChangeIsCanFix={this.onChangeIsCanFix} handleChangemaxVotePerTimeLoad={this.handleChangemaxVotePerTimeLoad}
                handleChangemaxVotePerChoice={this.handleChangemaxVotePerChoice} handleChangemaxVoteOfPoll={this.handleChangemaxVoteOfPoll}
                handleTimeLoadDaysChange={this.handleTimeLoadDaysChange} handleTimeLoadHoursChange={this.handleTimeLoadHoursChange} handleShowResultCaseChange={this.handleShowResultCaseChange}
                onChangeUpload={this.onChangeUpload} removePoll={this.removePoll} onChangeIsHasPollLength={this.onChangeIsHasPollLength}/>);
        });
        return (
            <div className="new-poll-container">
                <h1 className="page-title">Create Post</h1>
                <div className="new-poll-content">
                    <Form onFinish={this.handleSubmit} className="create-poll-form">
                        <FormItem className="poll-form-row">
                            <TextArea
                                placeholder="Enter your question"
                                style={{ fontSize: '16px' }}
                                autosize={{ minRows: 3, maxRows: 6 }}
                                name="question"
                                value={this.state.question.text}
                                onChange={this.handleQuestionForPostChange} />
                        </FormItem>
                        <Row gutter={[48, 16]}>
                            <Col xs={12}>
                                Đăng ẩn danh
                            </Col>
                            <Col xs={12}>
                                <Switch checkedChildren="Có" unCheckedChildren="Không" onChange={this.onChangeIsUnseenOwner} />
                            </Col>
                            <Col span={12}>
                                Chế độ đăng:
                            </Col>
                            <Col span={12}>
                                <Select
                                    name="hours"
                                    onChange={this.handleShowCaseChange}
                                    value={this.state.showCase}
                                    style={{ width: 200 }}
                                >
                                    <Option key={1} value={1}>Bí mật</Option>
                                    <Option key={2} value={2}>Riêng tư</Option>
                                    <Option key={3} value={3}>Công khai</Option>
                                    <Option key={4} value={4}>Giới hạn người</Option>
                                    <Option key={5} value={5}>Nhóm</Option>
                                </Select>
                            </Col>
                            {this.state.showCase === 4 ? <Col xs={12}>Những người sẽ nhìn thấy bài đăng: </Col> : null}
                            {this.state.showCase === 4 ? <Col xs={12}><FormItem validateStatus={this.state.validateStatusUser}
            help={this.state.errorMsgUser}><Mentions style={{ width: '100%' }} placeholder="Nhập '@' để tag bạn bè" loading={this.state.loading} onSearch={this.onSearch} onChange={this.onSelect}>
                                {this.state.users.map(({ id, username, name }) => (
                                    <Option key={id} value={username} className="antd-demo-dynamic-option">
                                        <span>{name} @{username}</span>
                                    </Option>
                                ))}
                            </Mentions></FormItem></Col> : null}
                            {this.state.showCase === 5 ? <Col xs={12}>Những nhóm sẽ đăng: </Col> : null}
                            {this.state.showCase === 5 ? <Col xs={12}><FormItem validateStatus={this.state.validateStatusGroup}
            help={this.state.errorMsgGroup}><Mentions style={{ width: '100%' }} placeholder="Nhập '@' để tag nhóm" loading={this.state.loading} onSearch={this.onSearchGroup} onChange={this.onSelectGroup}>
                                {this.state.groups.map((group) => (
                                    <Option key={group.id} value={group.code} className="antd-demo-dynamic-option">
                                        <span>{group.name} @{group.code}</span>
                                    </Option>
                                ))}
                            </Mentions></FormItem></Col> : null}
                            <Col xs={12}>
                                Lên lịch đăng bài
                            </Col>
                            <Col xs={12}>
                                <Switch checkedChildren="Có" unCheckedChildren="Không" onChange={this.onChangeIsDelay} />
                            </Col>
                            {this.state.isDelay ? <Col span={12}>
                                Ngày giờ đăng:
                            </Col> : null}
                            {this.state.isDelay ?
                                <Col span={12}>
                                    <Space direction="vertical" size={12}>
                                        <DatePicker
                                            format="DD-MM-YYYY HH:mm:ss"
                                            disabledDate={this.disabledDate}
                                            disabledTime={this.disabledDateTime}
                                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                                            showNow={false}
                                            value={this.state.publicDateMoment}
                                            onChange={this.handlePublicDateChange}
                                        />
                                    </Space></Col> : null}
                        </Row>

                        {pollViews}

                        <FormItem className="poll-form-row">
                            <Button type="dashed" onClick={this.addPoll}>
                                <PlusOutlined/> Add a Poll
                            </Button>
                        </FormItem>
                        <FormItem className="poll-form-row">
                            <Button type="primary"
                                htmlType="submit"
                                size="large"
                                disabled={this.isFormInvalid()}
                                className="create-poll-form-button">Create Post</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }
}

const PollCreate = (props) => {
    const config = {
        name: "file",
        action: API_BASE_URL + "/file/upload",
        headers: {
            authorization:
                'Bearer ' + localStorage.getItem(ACCESS_TOKEN)
        },

    };
    return (
        <div className="new-poll-container">
            <h1 className="page-title">Create Poll {(props.pollNumber + 1)}
            {
                props.pollNumber > 0 ? (
                    <CloseOutlined className="dynamic-delete-button-poll" disabled={props.pollNumber === 0} onClick={() => props.removePoll(props.pollNumber)} />
                ) : null
            }</h1>
            <div className="new-poll-content">
                <FormItem className="poll-form-row">
                    <TextArea
                        placeholder="Enter your question"
                        style={{ fontSize: '16px' }}
                        autosize={{ minRows: 3, maxRows: 6 }}
                        name="question"
                        value={props.poll.question.text}
                        onChange={(event) => props.handleQuestionChange(event, props.pollNumber)} />
                </FormItem>
                <FormItem className="poll-form-row">
                    <Upload {...config} listType="picture" maxCount={1} onChange={(info) => props.onChangeUpload(info, props.pollNumber)}>
                        {props.poll.photo === "" ? <Button icon={<UploadOutlined />}>Upload (Max: 1)</Button> : null}
                    </Upload></FormItem>
                {props.choiceViews}
                <FormItem className="poll-form-row">
                    <Button type="dashed" onClick={(event) => props.addChoice(event, props.pollNumber)} disabled={props.poll.choices.length === MAX_CHOICES}>
                        <PlusOutlined/> Add a choice
                    </Button>
                </FormItem>
                <Row gutter={[48, 16]}>
                    <Col span={12}>Thời hạn kết thúc: &nbsp;
                    </Col><Col span={12}><Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked onChange={() => props.onChangeIsHasPollLength(props.pollNumber)} />
                    </Col>
                    {props.poll.isHasPollLength ?<Col span={12}>
                        Poll length:
                    </Col>:null}
                    {props.poll.isHasPollLength ?<Col span={12}>
                        <span style={{ marginRight: '18px' }}>
                            <Select
                                name="days"
                                defaultValue="1"
                                onChange={(event) => props.handlePollDaysChange(event, props.pollNumber)}
                                value={props.poll.pollLength.days}
                                style={{ width: 60 }} >
                                {
                                    Array.from(Array(8).keys()).map(i =>
                                        <Option key={i}>{i}</Option>
                                    )
                                }
                            </Select> &nbsp;Days
                        </span>
                        <span>
                            <Select
                                name="hours"
                                defaultValue="0"
                                onChange={(event) => props.handlePollHoursChange(event, props.pollNumber)}
                                value={props.poll.pollLength.hours}
                                style={{ width: 60 }} >
                                {
                                    Array.from(Array(24).keys()).map(i =>
                                        <Option key={i}>{i}</Option>
                                    )
                                }
                            </Select> &nbsp;Hours
                        </span>
                    </Col>:null}


                    <Col span={12}>Bầu chọn ẩn danh&nbsp;
                    </Col><Col span={12}><Switch checkedChildren="Có" unCheckedChildren="Không" onChange={() => props.onChangeIsUnseenUserForVote(props.pollNumber)} />
                    </Col><Col span={12}>Cho phép thêm lựa chọn&nbsp;
                    </Col><Col span={12}><Switch checkedChildren="Có" unCheckedChildren="Không" onChange={() => props.onChangeIsAddChoice(props.pollNumber)} />
                    </Col>
                    {props.poll.isAddChoice ? (<Col span={12}>Người thêm lựa chọn bị ẩn danh&nbsp;</Col>) : null}
                    {props.poll.isAddChoice ? (<Col span={12}><Switch checkedChildren="Có" unCheckedChildren="Không" disabled={props.poll.isAddChoice ? false : true} onChange={() => props.onChangeIsUnseenUserForAddChoice(props.pollNumber)} />
                    </Col>) : null}<Col span={12}>Cho phép sửa lựa chọn&nbsp;
                    </Col><Col span={12}><Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked onChange={() => props.onChangeIsCanFix(props.pollNumber)} />
                    </Col>
                    <Col span={12}>Số lượng phiếu bầu tối đa:</Col>
                    <Col span={12}><InputNumber min={1} defaultValue={1} value={props.poll.maxVotePerTimeLoad} onChange={(event) => props.handleChangemaxVotePerTimeLoad(event, props.pollNumber)} />
                        &nbsp;Lần</Col>
                    <Col span={12}>Mỗi lựa chọn được bầu tối đa:</Col>
                    <Col span={12}><InputNumber min={1} defaultValue={1} value={props.poll.maxVotePerChoice} onChange={(event) => props.handleChangemaxVotePerChoice(event, props.pollNumber)} />
                        &nbsp;Lần</Col>
                    {props.poll.timeLoad.hours === 0 && props.poll.timeLoad.days === 0 ? null : (<Col span={12}>Số lượng phiếu bầu tối đa 2:</Col>)}
                    {props.poll.timeLoad.hours === 0 && props.poll.timeLoad.days === 0 ? null : (

                        <Col span={12}><InputNumber min={1} defaultValue={1} value={props.poll.maxVoteOfPoll} disabled={props.poll.timeLoad.hours === 0 && props.poll.timeLoad.days === 0 ? true : false} onChange={(event) => props.handleChangemaxVoteOfPoll(event, props.pollNumber)} />
                            &nbsp;Lần</Col>)
                    }
                    <Col style={{display:"none"}} span={12}>
                        Thời gian được thiết lập lại số phiếu:
                    </Col>
                    <Col span={12} style={{display:"none"}}>
                        <span style={{ marginRight: '18px' }}>
                            <Select
                                name="days"
                                defaultValue="1"
                                onChange={(event) => props.handleTimeLoadDaysChange(event, props.pollNumber)}
                                value={props.poll.timeLoad.days}
                                style={{ width: 60 }} >
                                {
                                    Array.from(Array(8).keys()).map(i =>
                                        <Option key={i}>{i}</Option>
                                    )
                                }
                            </Select> &nbsp;Days
                        </span>
                        <span>
                            <Select
                                name="hours"
                                defaultValue="0"
                                onChange={(event) => props.handleTimeLoadHoursChange(event, props.pollNumber)}
                                value={props.poll.timeLoad.hours}
                                style={{ width: 60 }} >
                                {
                                    Array.from(Array(24).keys()).map(i =>
                                        <Option key={i}>{i}</Option>
                                    )
                                }
                            </Select> &nbsp;Hours
                        </span>
                    </Col>
                    <Col span={12}>
                        Chế độ hiển thị kết quả:
                    </Col>
                    <Col span={12}>
                        <Select
                            name="hours"
                            onChange={(event) => props.handleShowResultCaseChange(event, props.pollNumber)}
                            value={props.poll.showResultCase}
                            style={{ width: 200 }}
                        >
                            <Option key={1} value={1}>Được xem ngay</Option>
                            <Option key={2} value={2}>Sau khi kết thúc</Option>
                            <Option key={3} value={3} disabled={props.poll.isCanFix ? true : false}>Sau khi bầu</Option>
                            <Option key={4} value={4}>Không được xem</Option>
                        </Select>
                    </Col>
                </Row>
                {/* <Select
                        name="timeRS"
                        defaultValue="0"
                        onChange={this.handleChangetimeLoad}
                        value={this.state.timeLoad}
                        style={{ width: 60 }} >
                        {
                            Array.from(Array(100).keys()).map(i =>
                                <Option key={i}>{i}</Option>
                            )
                        }
                    </Select> */}
            </div>
        </div>
    );
}

const PollChoice = (props) => {
    const config = {
        name: "file",
        action: API_BASE_URL + "/file/upload",
        headers: {
            authorization:
                'Bearer ' + localStorage.getItem(ACCESS_TOKEN)
        },

    };
    return (
        <FormItem validateStatus={props.choice.validateStatus}
            help={props.choice.errorMsg} className="poll-form-row">
            <Input
                placeholder={'Choice ' + (props.choiceNumber + 1)}
                size="large"
                value={props.choice.text}
                className={props.choiceNumber > 1 ? "optional-choice" : null}
                onChange={(event) => props.handleChoiceChange(event, props.choiceNumber, props.pollNumber)} />
            {
                props.choiceNumber > 1 ? (
                    <CloseOutlined className="dynamic-delete-button" disabled={props.choiceNumber <= 1} onClick={() => props.removeChoice(props.choiceNumber, props.pollNumber)} />
                ) : null
            }
            <TextArea
                placeholder={'Review ' + (props.choiceNumber + 1)}
                size="large"
                value={props.choice.review}
                className={props.choiceNumber > 1 ? "optional-textchoice" : "choice"}
                onChange={(event) => props.handleChoiceChangeReview(event, props.choiceNumber, props.pollNumber)}
                 />
                 <Upload {...config} listType="picture" className="upload-inline" maxCount={1} onChange={(info) => props.onChangeUploadChoice(info, props.choiceNumber, props.pollNumber)}>
                    {props.choice.photo == null ? <Button className="button-upload" icon={<UploadOutlined />}>Upload</Button> : <Button className="button-upload" disabled icon={<UploadOutlined />}>Upload</Button>}
                </Upload>


        </FormItem>
    );
}


export default NewPoll;