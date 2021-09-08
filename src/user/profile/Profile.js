import React, { Component } from 'react';
import PostList from '../../poll/PostList';
import { getUserProfile, changeAvatar, changeName } from '../../util/APIUtils';
import { Avatar, Tabs, notification, Button } from 'antd';
import { getAvatarColor } from '../../util/Colors';
import { formatDate } from '../../util/Helpers';
import LoadingIndicator from '../../common/LoadingIndicator';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './Profile.css';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import { Upload, Input,Form } from 'antd';
import ImgCrop from 'antd-img-crop';
import { CameraOutlined, EditOutlined,CloseOutlined } from '@ant-design/icons';
import { 
    NAME_MIN_LENGTH, NAME_MAX_LENGTH, API_BASE_URL,ACCESS_TOKEN
} from '../../constants';
const TabPane = Tabs.TabPane;
class Profile extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            urlImage: "",
            isLoading: false,
            uploading: false,
            fileResponse: [],
            fileList: [],
            isEdit: false,
            valueName: "",
            stompClient: null,
        }
        this.loadUserProfile = this.loadUserProfile.bind(this);
    }
    beforeUpload = async file => {
        if (this._isMounted) {
            this.setState(state => ({
                fileList: [...state.fileList, file],
            }));
        }
        const formData = new FormData();
        formData.append("file", this.state.fileList[0]);
        //console.log(this.state.fileList);
        changeAvatar(formData)
            .then(res => {
                //console.log(res.data);
                const user = this.state.user;
                this.setState({
                    user:{
                        ...user,
                        photo: res.id
                    }
                })
                notification.success({
                    message: 'Polling App',
                    description: `Avatar file uploaded successfully`,
                });
                //window.location = window.location.href;
            });
        if (this._isMounted) {
            this.setState({
                uploading: true,
            });
        }
        
        return false;
    };

    loadUserProfile(username) {
        if (this._isMounted) {
            this.setState({
                isLoading: true
            });
        }

        getUserProfile(username)
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        user: response,
                        valueName: response.name,
                        isLoading: false
                    });
                }
            }).catch(error => {
                if (error.status === 404) {
                    if (this._isMounted) {
                        this.setState({
                            notFound: true,
                            isLoading: false
                        });
                    }
                } else {
                    if (this._isMounted) {
                        this.setState({
                            serverError: true,
                            isLoading: false
                        });
                    }
                }
            });
    }

    componentDidMount() {
        this._isMounted = true;
        const username = this.props.match.params.username;
        if(this.props.currentUser!=null){
            this.loadUserProfile(username);
        
            const socket = new SockJS(API_BASE_URL + '/ws');
            const stompClient = Stomp.over(socket);
            const headers = { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN) };
            stompClient.connect(headers, () => {
                stompClient.subscribe(
                    '/user/queue/item', (response) => this.socketPoll(JSON.parse(response.body)), headers,
                );
            });
            if (this._isMounted) {
                this.setState({
                    stompClient: stompClient
                })
            }
        }
        
        
        console.log("dimount profile")

    }

    socketPoll = (data) => {
        if(data.type===10)
        {
            notification.info({
                message: `Notification`,
                description:
                  data.name,
                  placement: "bottomLeft",
                  onClick: ()=>this.props.history.push("/post/"+data.postId)
              });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
       if (this.state.stompClient != null) {
            //console.log("disccccccccccccccccccccccco")
            this.state.stompClient.send('/app/stop', {});
            this.state.stompClient.disconnect();
        }
        console.log("unmount")
    }
    componentDidUpdate(nextProps) {
        if (this.props.match.params.username !== nextProps.match.params.username) {
            this.loadUserProfile(nextProps.match.params.username);
        }
    }
    enter = (event) => {
        const name = event.target.value;
        if (this._isMounted) {
            this.setState({
                isLoading: true
            });
        }
        changeName(name)
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        user: {
                            ...this.state.user,
                            name: name
                        },
                        valueName: name,

                    });
                }
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Change name Succesfully!'
                });
            }).catch(error => {
                if (error.status === 401) {
                    this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
                } else {
                    notification.error({
                        message: 'Polling App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });
                }
            });
        if (this._isMounted) {
            this.setState({
                isEdit: !this.state.isEdit,
                isLoading: false
            })
        }
    }
    validateName = (name) => {
        if(name.length < NAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
            }
        } else if (name.length > NAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
              };            
        }
    }
    onEdit = () => {
        this.setState({
            isEdit: !this.state.isEdit
        })
    }
    onChangeName = (event,validateFunc) => {
        const value = event.target.value;
        this.setState({
            valueName: value,
            ...validateFunc(value)
        })
    }

    render() {
        if (this.state.isLoading) {
            return <LoadingIndicator />;
        }

        if (this.state.notFound) {
            return <NotFound />;
        }

        if (this.state.serverError) {
            return <ServerError />;
        }

        const tabBarStyle = {
            textAlign: 'center'
        };
        return (
            <div className="profile">
                {
                    this.state.user ? (
                        <div className="user-profile">
                            <div className="user-details">
                                <div className="user-avatar">
                                    {this.props.currentUser.username === this.state.user.username ?
                                        <ImgCrop rotate>
                                            <Upload
                                                // listType="picture-card"
                                                fileList={this.state.fileList}
                                                beforeUpload={this.beforeUpload}
                                                style={{display:"none"}}
                                            >
                                                <CameraOutlined style={{ position: "absolute", marginLeft: "52px", marginTop: "52px", zIndex: "1" }} />
                                                {this.state.user.photo == null ?
                                                    (<Avatar className="user-avatar-circle ava"
                                                        style={{ backgroundColor: getAvatarColor(this.state.user.name) }} >
                                                        {this.state.user.name[0].toUpperCase()}
                                                    </Avatar>) : (
                                                        <Avatar className="user-avatar-circle  ava" 
                                                        //src={API_BASE_URL+"/file/getImage/" + this.state.user.photo} 
                                                        src={"https://drive.google.com/uc?export=view&id="+this.state.user.photo}
                                                        />)}
                                            </Upload>
                                            
                                        </ImgCrop> : <>{this.state.user.photo == null ?
                                            (<Avatar className="user-avatar-circle"
                                                style={{ backgroundColor: getAvatarColor(this.state.user.name) }} >
                                                {this.state.user.name[0].toUpperCase()}
                                            </Avatar>) : (
                                                <Avatar className="user-avatar-circle" 
                                                src={"https://drive.google.com/uc?export=view&id="+this.state.user.photo}
                                                //src={API_BASE_URL+"/file/getImage/" + this.state.user.photo} 
                                                />)}</>}
                                </div>
                                
                                <div className="user-summary">
                                    <div className="full-name">{this.state.isEdit ? <><Form><Form.Item validateStatus={this.state.validateStatus}
                            help={this.state.errorMsg}><Input value={this.state.valueName} onChange={(event) => this.onChangeName(event, this.validateName)} onPressEnter={this.enter}></Input><Button type="text" shape="circle" onClick={this.onEdit} style={{ float: "right",position: "fixed" }} icon={<CloseOutlined />}></Button></Form.Item></Form></> : <>{this.state.user.name}{this.state.user.username === this.props.currentUser.username && <Button type="text" shape="circle" onClick={this.onEdit} style={{ float: "right" }} icon={<EditOutlined />}></Button>}</>}</div>
                                    <div className="username">@{this.state.user.username}</div>
                                    <div className="user-joined">
                                        Joined {formatDate(this.state.user.joinedAt)}
                                    </div>
                                </div>
                                {/* <div className="user-summary">
                                    <div className="full-name">{this.state.user.name}{this.state.user.username===this.props.currentUser.username&&<Button type="text" shape="circle" style={{ float: "right" }} icon={<EditOutlined />}></Button>}</div>
                                    <div className="username">@{this.state.user.username}</div>
                                    <div className="user-joined">
                                        Joined {formatDate(this.state.user.joinedAt)}
                                    </div>
                                </div> */}
                            </div>
                            <div className="user-poll-details">
                                <Tabs defaultActiveKey="1"
                                    animated={false}
                                    tabBarStyle={tabBarStyle}
                                    size="large"
                                    onChange={this.callBack}
                                    className="profile-tabs">
                                    <TabPane tab={`${this.state.user.pollCount} Posts`} key="1">
                                        <PostList socket={true} key="1" currentUser={this.props.currentUser} handleLogout={this.props.handleLogout} username={this.props.match.params.username} type="USER_CREATED_POSTS" isAuthenticated={this.props.isAuthenticated} />
                                    </TabPane>
                                    <TabPane tab={`${this.state.user.voteCount} Votes`} key="2">
                                        <PostList socket={true} key="2" currentUser={this.props.currentUser} handleLogout={this.props.handleLogout} username={this.props.match.params.username} type="USER_VOTED_POSTS" isAuthenticated={this.props.isAuthenticated} />
                                    </TabPane>
                                    {this.props.currentUser.username===this.props.match.params.username&&<TabPane tab={`${this.state.user.storageCount} Save`} key="3">
                                        <PostList socket={true} key="3" currentUser={this.props.currentUser} handleLogout={this.props.handleLogout} username={this.props.match.params.username} type="USER_SAVE_POSTS" isAuthenticated={this.props.isAuthenticated} />
                                    </TabPane>}
                                </Tabs>
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    }
}

export default Profile;