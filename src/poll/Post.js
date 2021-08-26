import React, { Component } from 'react';
import './Post.css';
import { Comment, Avatar, Card, Divider } from 'antd';
//import { getAllComment, commentPost, replyComment } from '../util/APIUtils';
import { Link } from 'react-router-dom';
import { getAvatarColor } from '../util/Colors';
import { formatDateTime } from '../util/Helpers';
import { API_BASE_URL, ACCESS_TOKEN, POLL_CHOICE_MAX_LENGTH, POLL_LIST_SIZE } from '../constants';
import { Image, Badge, List } from 'antd';
import { Popover, Upload } from 'antd';
import { Form, Input, Col, notification, Switch, Row, Tooltip } from 'antd';
import { HeartOutlined, HeartTwoTone, MessageOutlined, UploadOutlined, MoreOutlined, DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Radio, Button } from 'antd';
const { TextArea } = Input
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const config = {
    name: "file",
    action: API_BASE_URL + "/file/upload",
    headers: {
        authorization:
            'Bearer ' + localStorage.getItem(ACCESS_TOKEN)
    },

};
const getTime = (time) => {
    if (time == null) return ""
    const timeNew = new Date(time).getTime();
    const currentTime = new Date().getTime();

    var difference_ms = currentTime - timeNew;
    var seconds = Math.floor((difference_ms / 1000) % 60);
    var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
    var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
    var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

    let timeRemaining;
    if (days > 7) {
        timeRemaining = formatDateTime(time);
    }
    else if (days > 0) {
        timeRemaining = days + " ngày trước";
    } else if (hours > 0) {
        timeRemaining = hours + " giờ trước";
    } else if (minutes > 0) {
        timeRemaining = minutes + " phút trước";
    } else if (seconds > 0) {
        timeRemaining = seconds + " giây trước";
    } else {
        timeRemaining = "Vừa mới";
    }

    return timeRemaining;
}
const getTime2 = (time) => {
    if (time == null) return ""
    const timeNew = new Date(time).getTime();
    const currentTime = new Date().getTime();

    var difference_ms = timeNew - currentTime;
    var seconds = Math.floor((difference_ms / 1000) % 60);
    var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
    var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
    var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

    let timeRemaining;
    if (days > 0) {
        timeRemaining = "Còn " + days + " ngày";
    } else if (hours > 0) {
        timeRemaining = "Còn " + hours + " giờ";
    } else if (minutes > 0) {
        timeRemaining = "Còn " + minutes + " phút";
    } else if (seconds > 0) {
        timeRemaining = "Còn " + seconds + " giây";
    } else {
        timeRemaining = "";
    }

    return timeRemaining;
}
// const CommentList = ({ comments }) => {
//     const arrayReply = Array(comments.length).fill(false);
//     return (
//         <List
//             dataSource={comments}
//             // header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
//             itemLayout="horizontal"
//             renderItem={(props,index) => <><Comment
//                 actions={[<span key="comment-nested-reply-to" onClick={() => arrayReply[index]=!arrayReply[index]}>Reply to</span>]}
//                 author={props.user.name} avatar={<Avatar
//                     style={{ backgroundColor: getAvatarColor(props.user.name) }} >
//                     {props.user.name[0].toUpperCase()}
//                 </Avatar>} content={<p>{props.text}</p>} datetime={getTime(props.createDate)}>
//                 {props.replys != null && props.replys.length != 0 && <List
//                     dataSource={props.replys}
//                     itemLayout="horizontal"
//                     renderItem={reply => <Comment author={reply.user.name} avatar={reply.user.photo} content={<p>{reply.text}</p>} datetime={getTime(reply.createDate)}>
//                     </Comment>}
//                 />}

//             </Comment>{arrayReply[index]&&<Comment
//                     avatar={
//                         <Avatar
//                             style={{ backgroundColor: getAvatarColor(props.user.name) }} >
//                             {props.user.name[0].toUpperCase()}
//                         </Avatar>
//                     }
//                     content={
//                         <Editor
//                         />
//                     }
//                 />}</>}
//         />);
// }

const Editor = ({ onChange, onSubmit, submitting, value, textButton }) => (
    <>
        <Form.Item>
            <TextArea rows={3} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item style={{ marginBottom: "0px" }}>
            <Button htmlType="submit" style={{ float: "right" }} loading={submitting} onClick={onSubmit} type="primary">
                Add {textButton}
            </Button>
        </Form.Item>
    </>
);
class Post extends Component {

    constructor(props) {
        super(props);
        this.state = {
            choiceAdd: Array(this.props.post.polls.length).fill(null),
            choiceCanAdd: Array(this.props.post.polls.length).fill(true),
            choiceNew: Array(this.props.post.polls.length).fill({
                text: '',
                photo: null,
                review: ''
            }),
            // comments: [],
            // submittingComment: false,
            // valueComment: '',
            // showComment: false,
            // showReply: [],
            // valueReply: '',
            // submittingReply: [],
            // page: 0,
            isUpdateName: false,
            valueName: ''
        }
    }
    calculatePercentage = (choice, pollIndex) => {
        if (this.props.post.polls[pollIndex].totalVotes === 0) {
            return 0;
        }
        return (choice.voteCount * 100) / (this.props.post.polls[pollIndex].totalVotes);
    };

    isSelected = (pollIndex, choiceIndex) => {
        return this.props.post.polls[pollIndex].choices[choiceIndex].userVoteCount > 0;
    }

    getWinningChoice = (pollIndex) => {
        return this.props.post.polls[pollIndex].choices.reduce((prevChoice, currentChoice) =>
            currentChoice.voteCount > prevChoice.voteCount ? currentChoice : prevChoice,
            { voteCount: -Infinity }
        );
    }

    getTimeRemaining = (poll) => {
        if (poll.expirationDateTime == null) return "No limit"
        const expirationTime = new Date(poll.expirationDateTime).getTime();
        const currentTime = new Date().getTime();

        var difference_ms = expirationTime - currentTime;
        var seconds = Math.floor((difference_ms / 1000) % 60);
        var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
        var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
        var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

        let timeRemaining;

        if (days > 0) {
            timeRemaining = days + " days left";
        } else if (hours > 0) {
            timeRemaining = hours + " hours left";
        } else if (minutes > 0) {
            timeRemaining = minutes + " minutes left";
        } else if (seconds > 0) {
            timeRemaining = seconds + " seconds left";
        } else {
            timeRemaining = "less than a second left";
        }

        return timeRemaining;
    }

    componentDidMount() {
        this.setState({
            valueName: this.props.post.question
        })
    }

    onChange = (event, pollIndex) => {
        const choiceText = this.state.choiceNew.slice();
        choiceText[pollIndex] = Object.assign(choiceText[pollIndex], {
            text: event.target.value,
            ...this.validateChoice(event.target.value)
        });
        this.setState({
            choiceNew: choiceText,
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
    onReviewChange = (event, pollIndex) => {
        const choiceText = this.state.choiceNew.slice();
        choiceText[pollIndex] = Object.assign(choiceText[pollIndex], {
            review: event.target.value,
            ...this.validateChoice(choiceText[pollIndex].text)
        });
        this.setState({
            choiceNew: choiceText,
            // ...this.validateChoice(choiceText[pollIndex].text)
        });

    }
    onImageChoiceChange = (info, pollIndex) => {
        if (info.file.status !== "uploading") {
            //console.log(info);
            //console.log(this.state.choiceNew);

        }
        if (info.fileList.length === 0) {
            const polls = this.state.choiceNew.slice();
            polls[pollIndex].photo = null;
            this.setState({
                choiceNew: polls
            });
        }
        if (info.file.status === "done") {
            const polls = this.state.choiceNew.slice();
            //const isAddChoice = polls[indexPoll].isAddChoice;

            polls[pollIndex].photo = info.fileList[0].response.id;
            this.setState({
                choiceNew: polls
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
    addAChoice = (event, postIndex, pollIndex) => {
        this.props.addAChoice(event, postIndex, pollIndex, this.state.choiceNew[pollIndex]);
        const choiceCanAdd = this.state.choiceCanAdd.slice();
        choiceCanAdd[pollIndex] = true;
        const choiceText = this.state.choiceNew.slice();
        choiceText[pollIndex] = {
            text: '',
            review: '',
            photo: null
        };
        this.setState({
            choiceCanAdd: choiceCanAdd,
            choiceNew: choiceText
        })
    }
    removeAddChoice = (pollIndex) => {
        const choiceAdd = this.state.choiceAdd.slice();
        choiceAdd[pollIndex] = null;
        const choiceCanAdd = this.state.choiceCanAdd.slice();
        choiceCanAdd[pollIndex] = true;
        const choiceText = this.state.choiceNew.slice();
        choiceText[pollIndex] = {
            text: '',
            review: '',
            photo: null
        };
        this.setState(
            {
                choiceAdd: choiceAdd,
                choiceCanAdd: choiceCanAdd,
                choiceNew: choiceText
            }
        )

    }
    addChoiceInput = (postIndex, pollIndex) => {
        const choiceAdd = this.state.choiceAdd.slice();

        choiceAdd[pollIndex] = <div><Input
            placeholder='Choice '
            size="large"
            defaultValue={this.state.choiceNew[pollIndex].text}
            // className="cv-poll-choice"
            className="optional-choice"
            onPressEnter={(event) => this.addAChoice(event, postIndex, pollIndex)}
            onChange={(event) => this.onChange(event, pollIndex)}
        />
            <MinusOutlined className="dynamic-delete-button" onClick={() => this.removeAddChoice(pollIndex)} />
            <TextArea
                placeholder={'Review'}
                size="large"
                defaultValue={this.state.choiceNew[pollIndex].review}
                // className="choice"
                className="optional-textchoice2"
                onChange={(event) => this.onReviewChange(event, pollIndex)}
                onPressEnter={(event) => this.addAChoice(event, postIndex, pollIndex)}
            />
            <Upload {...config} listType="picture" className="upload-inline" maxCount={1} onChange={(info) => this.onImageChoiceChange(info, pollIndex)}>
                {this.state.choiceNew[pollIndex].photo == null ? <Button className="button-upload2" icon={<UploadOutlined />}>Upload</Button> : <Button className="button-upload" disabled icon={<UploadOutlined />}>Upload</Button>}
            </Upload></div>
        const choiceCanAdd = this.state.choiceCanAdd.slice();
        choiceCanAdd[pollIndex] = false;
        this.setState(
            {
                choiceAdd: choiceAdd,
                choiceCanAdd: choiceCanAdd
            }
        )
    }
    handleChangeComment = (event) => {
        this.props.handleChangeComment(event, this.props.postIndex);
        // this.setState({
        //     valueComment: event.target.value
        // })
    }
    handleSubmitComment = () => {
        this.props.handleSubmitComment(this.props.postIndex);
        // if (!this.state.valueComment) {
        //     return;
        // }
        // if (!this.props.isAuthenticated) {
        //     this.props.history.push("/login");
        //     notification.info({
        //         message: 'Polling App',
        //         description: "Please login to comment.",
        //     });
        //     return;
        // }
        // this.setState({
        //     submittingComment: true,
        // });
        // commentPost(this.props.post.id, this.state.valueComment)
        //     .then(response => {
        //         const comment = this.state.comments.slice();
        //         this.setState({
        //             comments: comment.concat(response),
        //             submittingComment: false,
        //             valueComment: ''
        //         })
        //     }).catch(error => {
        //         if (error.status === 401) {
        //             this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
        //         } else {
        //             notification.error({
        //                 message: 'Polling App',
        //                 description: error.message || 'Sorry! Something went wrong. Please try again!'
        //             });
        //         }
        //     });
        // this.setState({
        //     submittingComment: false
        // })
    }
    onComment = (page = 0, size = POLL_LIST_SIZE) => {
        this.props.onComment(page, size, this.props.post.id, this.props.postIndex)
    }
    onReply = (index) => {
        this.props.onReply(this.props.postIndex, index);
        // const showReply = this.state.showReply;
        // showReply[index] = !showReply[index];
        // this.setState({
        //     showReply: showReply
        // })
    }
    handleChangeReply = (event) => {
        this.props.handleChangeReply(event, this.props.postIndex);
        // this.setState({
        //     valueReply: event.target.value
        // })
    }
    handleSubmitReply = (index) => {
        this.props.handleSubmitReply(this.props.postIndex, index);
        // if (!this.state.valueReply) {
        //     return;
        // }
        // if (!this.props.isAuthenticated) {
        //     this.props.history.push("/login");
        //     notification.info({
        //         message: 'Polling App',
        //         description: "Please login to reply.",
        //     });
        //     return;
        // }
        // const submittingReply = this.state.submittingReply;
        // submittingReply[index] = true;
        // this.setState({
        //     submittingReply: submittingReply,
        // });
        // replyComment(this.props.post.id, this.state.comments[index].id, this.state.valueReply)
        //     .then(response => {
        //         const comment = this.state.comments.slice();
        //         comment.forEach((cm, index) => {
        //             if (cm.id === response.id) {
        //                 comment[index] = response;
        //             }
        //         })
        //         const submittingReply2 = this.state.submittingReply;
        //         submittingReply2[index] = false;
        //         this.setState({
        //             comments: comment,
        //             submittingReply: submittingReply2,
        //             valueReply: ''
        //         })
        //     }).catch(error => {
        //         if (error.status === 401) {
        //             this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
        //         } else {
        //             notification.error({
        //                 message: 'Polling App',
        //                 description: error.message || 'Sorry! Something went wrong. Please try again!'
        //             });
        //         }
        //     });
    }
    onClickUpdateName = () => {
        this.setState({
            isUpdateName: !this.state.isUpdateName
        })
    }
    onChangeName = (event) => {
        this.setState({
            valueName: event.target.value
        })
    }
    updateName = () => {
        this.setState({
            isUpdateName: !this.state.isUpdateName
        })
        this.props.updateName(this.state.valueName, this.props.postIndex);
    }
    render() {
        const { comments, submittingComment, valueComment, showReply } = this.props;
        const commentViews = [];
        const loadMore = this.props.showComment && comments.length > 0&&!this.props.isLastComment && <Link to="#" onClick={() => this.props.onLoadMoreComment(this.props.pageComment + 1, POLL_LIST_SIZE, this.props.post.id, this.props.postIndex)}>Load More...</Link>
        commentViews.push(<List
        key={1}
            dataSource={comments}
            loadMore={loadMore}
            // header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
            itemLayout="horizontal"
            renderItem={(props, index) => <List.Item key={index} style={{display:"block"}}><Comment
                actions={this.props.currentUser!=null&&(props.user.username === this.props.currentUser.username || this.props.post.createdBy.username === this.props.currentUser.username) ? [<span key="comment-nested-reply-to" onClick={() => this.onReply(index)}>Reply to</span>, <span key="delete-comment" onClick={() => this.props.onDeleteComment(this.props.postIndex, index)}>Delete</span>] : [<span key="comment-nested-reply-to" onClick={() => this.onReply(index)}>Reply to</span>]}
                author={<Link to={`/users/${props.user.username}`}>{props.user.name}</Link>} avatar={props.user.photo == null ? <Link to={`/users/${props.user.username}`}><Avatar
                    style={{ backgroundColor: getAvatarColor(props.user.name) }} >
                    {props.user.name[0].toUpperCase()}
                </Avatar></Link> : <Link to={`/users/${props.user.username}`}><Avatar
                    //src={API_BASE_URL + "/file/getImage/" + props.user.photo} 
                    src={"https://drive.google.com/uc?export=view&id="+props.user.photo}
                    >
                </Avatar></Link>} content={<p>{props.text}</p>} datetime={getTime(props.createDate)}>
                {props.replys !== null && props.replys.length !== 0 && <List
                    rowKey={record => record.id}
                    dataSource={props.replys}
                    itemLayout="horizontal"
                    renderItem={(reply, replyIndex) => <List.Item key={replyIndex}><Comment actions={this.props.currentUser!=null&&(reply.user.username === this.props.currentUser.username || this.props.post.createdBy.username === this.props.currentUser.username) && [<span key="delete-reply" onClick={() => this.props.onDeleteReply(this.props.postIndex, index, replyIndex)}>Delete</span>]} author={<Link to={`/users/${reply.user.username}`}>{reply.user.name}</Link>} avatar={reply.user.photo == null ? <Link to={`/users/${reply.user.username}`}><Avatar
                        style={{ backgroundColor: getAvatarColor(reply.user.name) }} >
                        {reply.user.name[0].toUpperCase()}
                    </Avatar></Link> : <Link to={`/users/${reply.user.username}`}><Avatar
                        //src={API_BASE_URL + "/file/getImage/" + reply.user.photo} 
                        src={"https://drive.google.com/uc?export=view&id="+reply.user.photo}
                        >
                    </Avatar></Link>} content={<p>{reply.text}</p>} datetime={getTime(reply.createDate)}>
                    </Comment></List.Item>}
                />}

            </Comment>{showReply[index] && this.props.currentUser != null &&<Comment
                avatar={this.props.currentUser.photo == null ?
                    <Avatar
                        style={{ backgroundColor: getAvatarColor(this.props.currentUser.name) }} >
                        {this.props.currentUser.name[0].toUpperCase()}
                    </Avatar> : <Avatar
                        //src={API_BASE_URL + "/file/getImage/" + this.props.currentUser.photo} 
                        src={"https://drive.google.com/uc?export=view&id="+this.props.currentUser.photo}
                        >
                    </Avatar>
                }
                content={
                    <Editor
                        onChange={this.handleChangeReply}
                        onSubmit={() => this.handleSubmitReply(index)}
                        submitting={this.props.submittingReply[index]}
                        value={this.props.valueReply}
                        textButton="Reply"
                    />
                }
            />}</List.Item>}
        />
           
        )


        const postView = [];
        this.props.post.polls.forEach((poll, pollIndex) => {
            const pollChoices = [];

            if (poll.isExpired || (poll.totalUserVotes === poll.maxVotePerTimeLoad && poll.showResultCase === 3 && !poll.isCanFix)) {
                const winningChoice = this.props.post.polls[pollIndex].expired ? this.getWinningChoice(pollIndex) : null;
                poll.choices.forEach((choice, choiceIndex) => {
                    pollChoices.push(<CompletedOrVotedPollChoice
                        isUnseenUserForAddChoice={poll.isUnseenUserForAddChoice}
                        key={choice.id}
                        choice={choice}
                        isWinner={winningChoice && choice.id === winningChoice.id}
                        handleClickShowListVoted={() => this.props.handleShowListVoted(choice.id, 0, 5)}
                        isSelected={this.isSelected(pollIndex, choiceIndex)}
                        percentVote={this.calculatePercentage(choice, pollIndex)}
                    />);
                });

            } else if (poll.showResultCase === 1 || (poll.totalUserVotes !== 0 && poll.showResultCase === 3 && !poll.isCanFix)) {
                poll.choices.forEach((choice, choiceIndex) => {
                    pollChoices.push(<CompletedOrVotedCanVotePollChoice
                        key={choice.id}
                        choice={choice}
                        isUnseenUserForVote={poll.isUnseenUserForVote}
                        isUnseenUserForAddChoice={poll.isUnseenUserForAddChoice}
                        isSelected={this.isSelected(pollIndex, choiceIndex)}
                        percentVote={this.calculatePercentage(choice, pollIndex)}
                        handleClickShowListVoted={() => this.props.handleShowListVoted(choice.id)}
                        handleClick={(event) => this.props.handleDeleteVoteSubmit(event, this.props.postIndex, pollIndex)}
                        handleClickDelChoice={(event) => this.props.handleDeleteChoiceSubmit(event, this.props.postIndex, pollIndex)}
                        isDelete={this.props.currentUser != null && ((this.props.currentUser.username === this.props.post.createdBy.username) || (this.props.currentUser.username === choice.createdBy.username)) && !poll.isExpired}
                        isOwner={this.props.currentUser != null && (this.props.currentUser.username === this.props.post.createdBy.username)}
                        canFix={poll.isCanFix}
                    />)
                })
            }

            else if (poll.showResultCase !== 1) {
                poll.choices.forEach((choice, choiceIndex) => {
                    pollChoices.push(
                        <Popover placement="right" key={choice.id} mouseEnterDelay={1}
                            content={
                                <div style={{ maxWidth: '500px', minWidth: '400px' }}>
                                    {choice.choicePrime != null && choice.choicePrime.photo != null && choice.choicePrime.photo !== "" ? <Image
                                        //src={API_BASE_URL + "/file/getImage/" + choice.choicePrime.photo}
                                        src={"https://drive.google.com/uc?export=view&id="+choice.choicePrime.photo}
                                    /> : null}
                                    {choice.choicePrime != null ? <div style={{ wordBreak: 'break-word' }}>{choice.choicePrime.review}</div> : null}
                                </div>}
                            title={
                                <>{choice.text}{poll.isUnseenUserForAddChoice ? null : (<span className="separator">•</span>)}{poll.isUnseenUserForAddChoice ? null : <Link className="creator-link" to={`/users/${choice.createdBy.username}`}>{choice.createdBy.name}</Link>}
                                </>}>
                            <div>
                                <Radio className="poll-choice-radio" key={choice.id} value={choice.id}>
                                    <span style={{ paddingLeft: "20px" }}>{choice.text}
                                        {this.props.isAuthenticated && this.props.currentUser.username === this.props.post.createdBy.username && !poll.isExpired &&
                                            <Tooltip title="Choice Delete" placement="top" arrowPointAtCenter={true}>
                                                <Button type="dashed" icon={<DeleteOutlined />} shape="circle" value={choice.id} onClick={(event) => this.props.handleDeleteChoiceSubmit(event, this.props.postIndex, pollIndex)} size='small' className="delete-button-choice" style={{ float: "right", marginRight: 10 }} /></Tooltip>}
                                        {this.isSelected(pollIndex, choiceIndex) && poll.isCanFix &&
                                            <Tooltip title="Vote Delete" placement="top" arrowPointAtCenter={true}>
                                                <Button type="dashed" icon={<MinusOutlined />} shape="circle" value={choice.id} onClick={(event) => this.props.handleDeleteVoteSubmit(event, this.props.postIndex, pollIndex)} size='small' className="delete-button" style={{ float: "right", marginRight: 3 }} /></Tooltip>}
                                    </span>
                                </Radio>
                            </div>
                        </Popover>

                    )
                })
            }
            postView.push(<PollItem key={pollIndex} postIndex={this.props.postIndex} choiceAdd={this.state.choiceAdd[pollIndex]}
                poll={poll} pollIndex={pollIndex} pollChoices={pollChoices} choiceCanAdd={this.state.choiceCanAdd[pollIndex]} choiceNew={this.state.choiceNew[pollIndex]}
                handleVoteChange={this.props.handleVoteChange} currentVote={this.props.currentVote} addChoiceInput={this.addChoiceInput}
                createdBy={this.props.post.createdBy} creationDateTime={this.props.post.creationDateTime} addAChoice={this.addAChoice}
                getTimeRemaining={this.getTimeRemaining} handleVoteSubmit={this.props.handleVoteSubmit} currentUser={this.props.currentUser}
                isOwner={this.props.currentUser != null && (this.props.currentUser.username === this.props.post.createdBy.username)}
                onEndPoll={this.props.onEndPoll}
            />)
        })
        const time = getTime2(this.props.post.publicDate);
        return (
            <>
                <Card style={{ marginBottom: 30 }} className="poll-content"
                // actions={[
                //     <div onClick= {()=>this.props.onLikePost(this.props.postIndex)}>{this.props.post.isUserLike ? <HeartTwoTone twoToneColor="#eb2f96" /> : <HeartOutlined key="like" />}{this.props.post.totalLike != null ? <span className="separator">•</span> : null}{this.props.post.totalLike}</div>,
                //     <div onClick={(event) => console.log("comment")}><MessageOutlined key="comment" />{this.props.post.totalComment != null ? <span className="separator">•</span> : null}{this.props.post.totalComment}</div>,
                // ]}
                >

                    <div className="poll-header">
                        <Popover placement="right" title="Tùy chọn" content={<ManagerPost isUserStorage={this.props.post.isUserStorage} isOwner={this.props.currentUser != null && (this.props.currentUser.username === this.props.post.createdBy.username)} onUpdatePost={this.onClickUpdateName} onDeletePost={this.props.onDeletePost} deleteFollowPost={this.props.deleteFollowPost} onFollowPost={this.props.onFollowPost} postIndex={this.props.postIndex} />} trigger="click">
                            <Button type="text" shape="circle" className="poll-info" icon={<MoreOutlined />}></Button>
                        </Popover>
                        <div className="poll-creator-info">
                            <Link className="creator-link" to={`/users/${this.props.post.createdBy.username}`}>
                                {this.props.post.createdBy.photo == null ? <Avatar className="poll-creator-avatar"
                                    style={{ backgroundColor: getAvatarColor(this.props.post.createdBy.name) }} >
                                    {this.props.post.createdBy.name[0].toUpperCase()}
                                </Avatar> : <Avatar className="poll-creator-avatar"
                                    //src={API_BASE_URL + "/file/getImage/" + this.props.post.createdBy.photo} 
                                    src={"https://drive.google.com/uc?export=view&id="+this.props.post.createdBy.photo}
                                    >
                                </Avatar>}
                                <span className="poll-creator-name">
                                    {this.props.post.createdBy.name}
                                </span>
                                <span className="poll-creator-username">
                                    @{this.props.post.createdBy.username}
                                </span>
                                {time !== '' && <span className="separator">•</span>}
                                {time !== '' && <span>{time}</span>}
                            </Link>

                            <Link to={"/post/" + this.props.post.id}>
                                <span className="poll-creation-date">
                                    {getTime(this.props.post.polls[0].creationDateTime)}
                                    {/* {formatDateTime(this.props.post.polls[0].creationDateTime)} */}
                                </span></Link>
                            <span className="separator">•</span>
                            <span className="poll-creation-date">
                                {this.props.post.showCase === 1 ? "Bí mật" : null}
                                {this.props.post.showCase === 2 ? "Riêng tư" : null}
                                {this.props.post.showCase === 3 ? "Công khai" : null}
                                {this.props.post.showCase === 4 ? "Giới hạn người" : null}
                                {this.props.post.showCase === 5 ? <Popover placement="right" id="grouplist" title="Danh sách nhóm" content={<InfomationGroups list={this.props.post.groupResponses}></InfomationGroups>} trigger="click"><Button type="text" className="poll-show-case-button">Nhóm</Button></Popover> : null}
                            </span>


                        </div>

                        <div className="poll-question">
                            {this.state.isUpdateName ? <TextArea value={this.state.valueName} onChange={this.onChangeName}></TextArea> : <>{this.props.post.question}</>}
                        </div>
                        {this.state.isUpdateName && <Button style={{ marginBottom: 15 }} onClick={this.updateName}>Update</Button>}
                        {postView}
                    </div>
                    <ul className="ant-card-actions">
                        <li style={{ width: "50%", cursor: "pointer" }}>
                            <div onClick={() => this.props.onLikePost(this.props.postIndex)}>{this.props.post.isUserLike ? <HeartTwoTone twoToneColor="#eb2f96" /> : <HeartOutlined key="like" />}{this.props.post.totalLike != null ? <span className="separator">•</span> : null}{this.props.post.totalLike}</div>
                        </li>
                        <li style={{ width: "50%", cursor: "pointer" }}>
                            <div onClick={(event) => this.onComment()}><MessageOutlined key="comment" />{this.props.post.totalComment != null ? <span className="separator">•</span> : null}{this.props.post.totalComment}</div>
                        </li>
                    </ul>
                    {this.props.showComment && <Divider style={{ margin: "0" }} />}

                    {this.props.showComment && this.props.currentUser != null && <Comment
                        avatar={this.props.currentUser.photo == null ?
                            <Avatar
                                style={{ backgroundColor: getAvatarColor(this.props.currentUser.name) }} >
                                {this.props.currentUser.name[0].toUpperCase()}
                            </Avatar> : <Avatar
                                //src={API_BASE_URL + "/file/getImage/" + this.props.currentUser.photo} 
                                src={"https://drive.google.com/uc?export=view&id="+this.props.currentUser.photo}
                                >
                            </Avatar>
                        }
                        content={
                            <Editor
                                onChange={this.handleChangeComment}
                                onSubmit={this.handleSubmitComment}
                                submitting={submittingComment}
                                value={valueComment}
                                textButton="Comment"
                            />
                        }
                    />}
                    {this.props.showComment && comments.length > 0 && commentViews }
                    {/* {this.props.showComment && comments.length > 0&&!this.props.isLastComment && <Link to="#" onClick={() => this.props.onLoadMoreComment(this.props.pageComment + 1, POLL_LIST_SIZE, this.props.post.id, this.props.postIndex)}>Load More...</Link>} */}


                </Card>

            </>
        );
    }
}
function ManagerPost(props) {
    return (
        <div>
            {props.isOwner&&<Button type="primary" style={{ marginBottom: "10px" }} block onClick={() => props.onUpdatePost(props.postIndex)}>Cập nhật</Button>}
            {!props.isUserStorage?<Button type="primary" style={{ marginBottom: "10px" }} block onClick={() => props.onFollowPost(props.postIndex)}>Lưu trữ</Button>:<Button type="primary" style={{ marginBottom: "10px" }} block onClick={() => props.deleteFollowPost(props.postIndex)}>Hủy Lưu trữ</Button>}
            <Button danger block onClick={() => props.onDeletePost(props.postIndex)}>Delete post</Button>
        </div>
    );
}
function InfomationGroups(props) {

    return (
        <div className="popInforPoll">
            <List
                dataSource={props.list}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Link to={`/groups/${item.code}`}>{item.name} <span style={{ color: '#657786' }}>@{item.code}</span></Link>}
                            description={<div><div><span>Người tạo: <Link to={`/users/${item.admin.username}`}>{item.admin.name} @{item.admin.username}</Link></span></div><div>Ngày tạo: {formatDateTime(item.createDate)}</div></div>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}
function Infomation(props) {
    return (
        <div className="popInforPoll">
            <Row gutter={[24, 8]}>
                <Col span={12}>Bầu chọn ẩn danh&nbsp;
                </Col> <Col span={12}>{props.poll.isUnseenUserForVote ? <Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked disabled={true} /> : <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} />}
                </Col><Col span={12}>Cho phép thêm lựa chọn&nbsp;
                </Col><Col span={12}>{props.poll.isAddChoice ? <Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked disabled={true} /> : <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} />}
                </Col>
                {props.poll.isAddChoice ? (<Col span={12}>Người thêm lựa chọn bị ẩn danh&nbsp;</Col>) : null}
                {props.poll.isAddChoice ? (<Col span={12}>{props.poll.isUnseenUserForAddChoice ? <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} defaultChecked /> : <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} />}
                </Col>) : null}<Col span={12}>Cho phép sửa lựa chọn&nbsp;
                </Col><Col span={12}>{props.poll.isCanFix ? <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} defaultChecked /> : <Switch checkedChildren="Có" unCheckedChildren="Không" disabled={true} />}
                </Col>
                <Col span={12}>Số lượng phiếu bầu tối đa:</Col>
                <Col span={12}>{props.poll.maxVotePerTimeLoad}
                    &nbsp;Lần</Col>
                <Col span={12}>Mỗi lựa chọn được bầu tối đa:</Col>
                <Col span={12}>{props.poll.maxVotePerChoice}
                    &nbsp;Lần</Col>
                {props.poll.timeLoad === 0 ? null : (<Col span={12}>Số lượng phiếu bầu tối đa 2:</Col>)}
                {props.poll.timeLoad === 0 ? null : (

                    <Col span={12}>{props.poll.maxVoteOfPoll}
                        &nbsp;Lần</Col>)
                }
                {props.poll.timeLoad === 0 ? null : <Col span={12}>
                    Thời gian được thiết lập lại số phiếu:
                </Col>}
                {props.poll.timeLoad === 0 ? null : <Col span={12}>
                    <span style={{ marginRight: '18px' }}>
                        {Math.floor(props.poll.timeLoad / 24)}
                        &nbsp;Days
                    </span>
                    <span>
                        {props.poll.timeLoad % 24}
                        &nbsp;Hours
                    </span>
                </Col>}
                <Col span={12}>
                    Chế độ hiển thị kết quả:
                </Col>
                <Col span={12}>
                    {props.poll.showResultCase === 1 ? 'Được xem ngay' : null}
                    {props.poll.showResultCase === 2 ? 'Sau khi kết thúc' : null}
                    {props.poll.showResultCase === 3 ? 'Sau khi bầu' : null}
                    {props.poll.showResultCase === 4 ? 'Không được xem' : null}

                </Col></Row>
            {!props.poll.isExpired && props.isOwner ? <Button onClick={(event) => props.onEndPoll(event, props.postIndex, props.pollIndex)} block danger>Kết thúc bầu chọn</Button> : null}
        </div>
    );
}

function PollItem(props) {
    return (
        <div className="poll-content">
            <div className="poll-header">
                <div className="text-number">
                    {props.pollIndex + 1}.
                </div>
                <Popover placement="right" title="Infomation" content={<Infomation poll={props.poll} onEndPoll={props.onEndPoll} isOwner={props.isOwner} pollIndex={props.pollIndex} postIndex={props.postIndex}></Infomation>} trigger="click">
                    <Button type="text" shape="circle" className="poll-info" icon={<MoreOutlined />}></Button>
                </Popover>
                <div className="poll-question">
                    {props.poll.question}
                </div>
                {(props.poll.photo !== null && props.poll.photo !== '') && <Image
//  src={props.poll.photo} https://drive.google.com/uc?export=view&id=10JehIGbJdThrsGzXV7dHxsDhjFjRryiX
src={"https://drive.google.com/uc?export=view&id="+props.poll.photo}
// src="https://drive.google.com/uc?id=1OqevuFEaO5XyT5Uxm1DcQ5t0DoeG0Ini&export=download"
                    // src={API_BASE_URL + "/file/getImage/" + props.poll.photo}
                /> }

                {/* <Image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"/> */}
            </div>
            <div className="poll-choices">
                <RadioGroup
                    className="poll-choice-radio-group"
                    onChange={(event) => props.handleVoteChange(event, props.pollIndex, props.postIndex)}
                    value={props.currentVote[props.pollIndex]}>
                    {props.pollChoices}
                </RadioGroup>
                {props.choiceCanAdd ? null : <Form><FormItem validateStatus={props.choiceNew.validateStatus}
                    help={props.choiceNew.errorMsg}>{props.choiceAdd}</FormItem></Form>}

            </div>
            <div className="poll-footer">
                {
                    !(props.poll.selectedChoice || props.poll.isExpired) ?
                        (<Button className="vote-button" disabled={!props.currentVote[props.pollIndex]} onClick={(event) => props.handleVoteSubmit(event, props.pollIndex, props.postIndex)}>Vote</Button>) : null
                }
                <span className="total-votes">{props.poll.totalVotes} votes</span>
                <span className="separator">•</span>
                <span className="time-left">
                    {
                        props.poll.isExpired ? "Final results" :
                            props.getTimeRemaining(props.poll)
                    }
                </span>
                {
                    (props.currentUser != null && props.choiceCanAdd && (props.poll.isAddChoice || props.createdBy.username === props.currentUser.username) && !props.poll.isExpired) && <Button type="dashed" style={{ float: 'right' }} onClick={() => props.addChoiceInput(props.postIndex, props.pollIndex)} icon={<PlusOutlined />} disabled={!props.choiceCanAdd}>
                        {window.screen.width > 768 && "Add a choice"}
                    </Button>
                }
                {
                    (!props.choiceCanAdd) && <Button type="dashed" style={{ float: 'right' }} onClick={(event) => props.addAChoice(event, props.postIndex, props.pollIndex)} disabled={props.choiceCanAdd}>
                        <PlusOutlined /> Submit
                    </Button>
                }
            </div>
        </div>
    );
}
function CompletedOrVotedPollChoice(props) {
    const percent = Math.round(props.percentVote * 100) / 100;
    return (
        <Popover placement="right" mouseEnterDelay={0.5} content={<div style={{ maxWidth: '500px', minWidth: '400px' }}>
            {props.choice.choicePrime != null && props.choice.choicePrime.photo != null && props.choice.choicePrime.photo !== "" ? <Image
                src={"https://drive.google.com/uc?export=view&id="+props.choice.choicePrime.photo}
                //src={API_BASE_URL + "/file/getImage/" + props.choice.choicePrime.photo}
            /> : null}
            {props.choice.choicePrime != null ? <div style={{ wordBreak: 'break-word' }}>{props.choice.choicePrime.review}</div> : null}
        </div>} title={<>{props.choice.text}{props.isUnseenUserForAddChoice ? null : (<span className="separator">•</span>)}{props.isUnseenUserForAddChoice ? null : <Link className="creator-link" to={`/users/${props.choice.createdBy.username}`}>{props.choice.createdBy.name}</Link>}</>}>
            <div className="cv-poll-choice">
                <span className="cv-poll-choice-details">
                    <span className="cv-choice-percentage">
                        {props.isUnseenUserForVote ? percent + '%' : <Button value={props.choice.id} style={{ fontWeight: 600 }} onClick={props.handleClickShowListVoted} type="text">{Math.round(props.percentVote * 100) / 100}%</Button>}
                        {/* {Math.round(props.percentVote * 100) / 100}% */}
                    </span>
                    <span className="cv-choice-text">
                        {props.choice.text}
                    </span>
                    {/* {
                    props.isSelected ? (
                        <span className="selected-choice-icon">
                            <CheckCircleOutlined />
                        </span>) : null
                } */}
                </span>
                <span className={props.isWinner ? 'cv-choice-percent-chart winner' : 'cv-choice-percent-chart'}
                    style={{ width: props.percentVote + '%' }}>
                </span>
            </div></Popover>
    );
}
function CompletedOrVotedCanVotePollChoice(props) {
    const percent = Math.round(props.percentVote * 100) / 100;
    return (
        <Popover placement="right" mouseEnterDelay={1} content={<div style={{ maxWidth: '500px', minWidth: '400px' }}>
            {props.choice.choicePrime != null && props.choice.choicePrime.photo != null && props.choice.choicePrime.photo !== "" ? <Image
                src={"https://drive.google.com/uc?export=view&id="+props.choice.choicePrime.photo}
                //src={API_BASE_URL + "/file/getImage/" + props.choice.choicePrime.photo}
            /> : null}
            {props.choice.choicePrime != null ? <div style={{ wordBreak: 'break-word' }}>{props.choice.choicePrime.review}</div> : null}
        </div>} title={<>{props.choice.text}{props.isUnseenUserForAddChoice ? null : (<span className="separator">•</span>)}{props.isUnseenUserForAddChoice ? null : <Link className="creator-link" to={`/users/${props.choice.createdBy.username}`}>{props.choice.createdBy.name}</Link>}</>}>
            <Badge count={props.choice.userVoteCount} offset={[-0, 0]} className="site-badge-count-4">

                <Radio className="poll-choice-radio" key={props.choice.id} value={props.choice.id}>

                    <span className="cv-poll-choice-details2">
                        <span className="cv-choice-percentage">
                            {props.isUnseenUserForVote && !props.isOwner ? percent + '%' : <Button value={props.choice.id} style={{ fontWeight: 600 }} onClick={props.handleClickShowListVoted} type="text">{Math.round(props.percentVote * 100) / 100}%</Button>}
                            {/* {Math.round(props.percentVote * 100) / 100}% */}
                        </span>
                        <span className="cv-choice-text">
                            {props.choice.text}
                        </span>
                    </span>

                    <span className={props.isSelected ? "cv-choice-percent-chart2 winner" : "cv-choice-percent-chart2"}
                        style={{ width: props.percentVote + '%' }}>
                    </span>

                    {/* {
                                props.isDelete ? (
                                    <Tooltip title="Choice Delete" placement="top" arrowPointAtCenter={true}>

                                        <Button type="dashed" style={{ marginRight: 10 }} shape="circle" icon={<DeleteOutlined />} value={props.choice.id} onClick={props.handleClickDelChoice} size='small' className="delete-button-choice" /> </Tooltip>
                                ) : null
                            }
                            {
                                props.isSelected && props.canFix ? (
                                    <Tooltip title="Vote Delete" placement="top" arrowPointAtCenter={true}>
                                        <Button type="dashed" style={{ marginRight: 3 }} shape="circle" icon={<MinusOutlined />} value={props.choice.id} onClick={props.handleClick} size='small' className="delete-button" /> </Tooltip>
                                ) : null
                            } */}
                    {props.isDelete &&
                        <Tooltip title="Choice Delete" placement="top" arrowPointAtCenter={true}><Button type="dashed" icon={<DeleteOutlined />} shape="circle" value={props.choice.id} onClick={props.handleClickDelChoice} size='small' className="delete-button-choice" style={{ float: "right", marginRight: 10 }} /></Tooltip>}
                    {props.isSelected && props.canFix &&
                        <Tooltip title="Vote Delete" placement="top" arrowPointAtCenter={true}><Button type="dashed" icon={<MinusOutlined />} shape="circle" value={props.choice.id} onClick={props.handleClick} size='small' className="delete-button" style={{ float: "right", marginRight: 3 }} /></Tooltip>}
                </Radio>

            </Badge></Popover>
    );
}


export default Post;