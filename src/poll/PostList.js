import React, { Component } from 'react';
import { getAllPolls, getUserCreatedPolls, getUserVotedPolls, getOnePolls, getAllPollsOfGroup, getAllUserVotedChoice, deletePost } from '../util/APIUtils';
import Post from './Post';
import { Avatar } from 'antd';
import { getAvatarColor } from '../util/Colors';
import { castVote, commentPost,deleteSavePost,savePost,getUserSavedPolls, getAllComment, replyComment,deleteComment,deleteReply } from '../util/APIUtils';
import { deleteVote, deleteChoice, addChoice, endPoll, castLike, getAllPollsSearch, updatePostName } from '../util/APIUtils';
import LoadingIndicator from '../common/LoadingIndicator';
import { Button, notification, Modal, List } from 'antd';
import { API_BASE_URL, POLL_LIST_SIZE, USER_LIST_SIZE, ACCESS_TOKEN } from '../constants';
import { withRouter } from 'react-router-dom';
import { VerticalAlignTopOutlined, PlusOutlined } from '@ant-design/icons';
import './PostList.css';
import InfiniteScroll from 'react-infinite-scroller';
import { BackTop } from 'antd';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
class PostList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: false,
            currentVotes: [],
            isLoading: false,
            visible: false,
            currentPollIndex: 0,
            currentPostIndex: 0,
            currentValue: '',
            prevY: 0,
            visibleListVoted: false,
            votedUsers: [],
            pageVoted: 0,
            currentChoiceId: 0,
            isLoading2: false,
            last2: false,
            stompClient: null,
            check: 0,
            visiblePost: false,

            comments: [],
            submittingComment: [],
            valueComment: [],
            showComment: [],
            showReply: [],
            valueReply: [],
            submittingReply: [],
            pageComment: [],
            isLastComment: [],

            visibleCommentDelete: false,
            currentCommentIndex: 0,

            visibleReplyDelete: false,
            currentReplyIndex: 0,
        };
        this.loadPostList = this.loadPostList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.handleVoteChange = this.handleVoteChange.bind(this);
        this.handleVoteSubmit = this.handleVoteSubmit.bind(this);
    }
    addAChoice = (event, postIndex, pollIndex, data) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to add Choice.",
            });
            return;
        }
        const pollId = this.state.posts[postIndex].polls[pollIndex].id;
        const addDataChoice = {
            text: data.text,
            review: data.review,
            photo: data.photo
        }
        addChoice(addDataChoice, pollId)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[postIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }

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
    }
    handleChangeComment = (event, postIndex) => {
        const valueComment = this.state.valueComment;
        valueComment[postIndex] = event.target.value;
        this.setState({
            valueComment: valueComment
        })
    }
    handleSubmitComment = (postIndex) => {
        if (!this.state.valueComment[postIndex]) {
            return;
        }
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to comment.",
            });
            return;
        }
        const submittingComment = this.state.submittingComment;
        submittingComment[postIndex] = true;
        this.setState({
            submittingComment: submittingComment,
        });
        commentPost(this.state.posts[postIndex].id, this.state.valueComment[postIndex])
            .then(response => {
                const comments = this.state.comments.slice();
                comments[postIndex] = comments[postIndex].concat(response);
                const posts = this.state.posts.slice();
                posts[postIndex].totalComment++;
                const valueComment = this.state.valueComment.slice();
                valueComment[postIndex] = '';
                this.setState({
                    comments: comments,
                    valueComment: valueComment,
                    posts: posts
                })
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
        submittingComment[postIndex] = false;
        this.setState({
            submittingComment: submittingComment
        })
    }
    onComment = (page = 0, size = POLL_LIST_SIZE, postId, postIndex) => {
        if (!this.state.showComment[postIndex]) {
            this.onLoadMoreComment(page,size,postId,postIndex);
            // if (this.state.pageComment[postIndex] === page) {
            //     getAllComment(postId, page, size)
            //         .then(response => {
            //             const comment = response.content;
            //             const comments = this.state.comments.slice();
            //             comments[postIndex] = comment;
            //             const showReply = this.state.showReply.slice();
            //             showReply[postIndex] = Array(comment.length).fill(false);
            //             const submittingReply = this.state.submittingReply.slice();
            //             submittingReply[postIndex] = Array(comment.length).fill(false);
            //             const pageComment = this.state.pageComment.slice();
            //             pageComment[postIndex] = response.page;
            //             const isLastComment = this.state.isLastComment.slice();
            //             isLastComment[postIndex] = response.last;
            //             this.setState({
            //                 comments: comments,
            //                 showReply: showReply,
            //                 submittingReply: submittingReply,
            //                 pageComment: pageComment,
            //                 isLastComment: isLastComment
            //             })
            //         }).catch(error => {
            //             if (error.status === 401) {
            //                 this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
            //             } else {
            //                 notification.error({
            //                     message: 'Polling App',
            //                     description: error.message || 'Sorry! Something went wrong. Please try again!'
            //                 });
            //             }
            //         });
            // }
            // else {
            //     getAllComment(this.props.post.id, page, size)
            //         .then(response => {
            //             const comment = this.state.comments[postIndex].slice().concat(response.content);
            //             const comments = this.state.comments.slice();
            //             comments[postIndex] = comment;
            //             const showReply = this.state.showReply.slice();
            //             showReply[postIndex] = Array(comment.length).fill(false);
            //             const submittingReply = this.state.submittingReply.slice();
            //             submittingReply[postIndex] = Array(comment.length).fill(false);
            //             const pageComment = this.state.pageComment.slice();
            //             pageComment[postIndex] = response.page;
            //             const isLastComment = this.state.isLastComment.slice();
            //             isLastComment[postIndex] = response.last;
            //             this.setState({
            //                 comments: comments,
            //                 showReply: showReply,
            //                 submittingReply: submittingReply,
            //                 pageComment: pageComment,
            //                 isLastComment: isLastComment
            //             })
            //         }).catch(error => {
            //             if (error.status === 401) {
            //                 this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
            //             } else {
            //                 notification.error({
            //                     message: 'Polling App',
            //                     description: error.message || 'Sorry! Something went wrong. Please try again!'
            //                 });
            //             }
            //         });
            // }

        }
        const showComment = this.state.showComment.slice();
        showComment[postIndex] = !showComment[postIndex];
        this.setState({
            showComment: showComment
        })
    }
    onLoadMoreComment = (page = 0, size = POLL_LIST_SIZE, postId, postIndex) =>{
        if (this.state.pageComment[postIndex] === page) {
            getAllComment(postId, page, size)
                .then(response => {
                    const comment = response.content;
                    const comments = this.state.comments.slice();
                    comments[postIndex] = comment;
                    const showReply = this.state.showReply.slice();
                    showReply[postIndex] = Array(comment.length).fill(false);
                    const submittingReply = this.state.submittingReply.slice();
                    submittingReply[postIndex] = Array(comment.length).fill(false);
                    const pageComment = this.state.pageComment.slice();
                    pageComment[postIndex] = response.page;
                    const isLastComment = this.state.isLastComment.slice();
                    isLastComment[postIndex] = response.last;
                    this.setState({
                        comments: comments,
                        showReply: showReply,
                        submittingReply: submittingReply,
                        pageComment: pageComment,
                        isLastComment: isLastComment
                    })
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
        }
        else {
            getAllComment(postId, page, size)
                .then(response => {
                    const comment = this.state.comments[postIndex].slice().concat(response.content);
                    const comments = this.state.comments.slice();
                    comments[postIndex] = comment;
                    const showReply = this.state.showReply.slice();
                    showReply[postIndex] = Array(comment.length).fill(false);
                    const submittingReply = this.state.submittingReply.slice();
                    submittingReply[postIndex] = Array(comment.length).fill(false);
                    const pageComment = this.state.pageComment.slice();
                    pageComment[postIndex] = response.page;
                    const isLastComment = this.state.isLastComment.slice();
                    isLastComment[postIndex] = response.last;
                    this.setState({
                        comments: comments,
                        showReply: showReply,
                        submittingReply: submittingReply,
                        pageComment: pageComment,
                        isLastComment: isLastComment
                    })
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
        }
    }
    onReply = (postIndex, index) => {
        const showReply = this.state.showReply;
        showReply[postIndex][index] = !showReply[postIndex][index];
        this.setState({
            showReply: showReply
        })
    }
    handleChangeReply = (event, postIndex) => {
        const valueReply = this.state.valueReply.splice();
        valueReply[postIndex] = event.target.value;
        this.setState({
            valueReply: valueReply
        })
    }
    handleSubmitReply = (postIndex, index) => {
        if (!this.state.valueReply[postIndex]) {
            return;
        }
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to reply.",
            });
            return;
        }
        const submittingReply = this.state.submittingReply;
        submittingReply[postIndex][index] = true;
        this.setState({
            submittingReply: submittingReply,
        });
        replyComment(this.state.posts[postIndex].id, this.state.comments[postIndex][index].id, this.state.valueReply[postIndex])
            .then(response => {
                const comment = this.state.comments.slice()[postIndex];
                comment.some((cm, index) => {
                    if (cm.id === response.commentId) {
                        comment[index].replys = comment[index].replys.concat(response);
                    }
                    return cm.id === response.commentId;
                })
                const comments = this.state.comments;
                comments[postIndex] = comment;
                const submittingReply2 = this.state.submittingReply;
                submittingReply2[postIndex][index] = false;
                const valueReply = this.state.valueReply;
                valueReply[postIndex] = false;
                this.setState({
                    comments: comments,
                    submittingReply: submittingReply2,
                    valueReply: valueReply
                })
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
    }
    loadPostList = (page = 0, size = POLL_LIST_SIZE) => {
        let promise;

        if (this._isMounted) {
            this.setState({
                isLoading: true
            });
        }
        switch (this.props.type) {
            case 'GROUP':
                promise = getAllPollsOfGroup(this.props.match.params.code, page, size);
                break;
            case 'ONE_POST':
                promise = getOnePolls(this.props.match.params.id);
                break;
            case 'USER_CREATED_POSTS':
                promise = getUserCreatedPolls(this.props.username, page, size);
                break;
            case 'USER_VOTED_POSTS':
                promise = getUserVotedPolls(this.props.username, page, size);
                break;
            case 'SEARCH_POST':
                promise = getAllPollsSearch(this.props.match.params.search, page, size);
                break;
            case 'USER_SAVE_POSTS':
                promise = getUserSavedPolls(page, size);
                break;
            default:
                promise = getAllPolls(page, size);

        }
        // if (this.props.type === 'GROUP') {
        //     promise = getAllPollsOfGroup(this.props.match.params.code, page, size);
        // }
        // else if (this.props.type === 'ONE_POST') {
        //     promise = getOnePolls(this.props.match.params.id);
        // }
        // else if (this.props.type === 'USER_CREATED_POSTS') {
        //     promise = getUserCreatedPolls(this.props.username, page, size);
        // }
        // else if (this.props.type === 'USER_VOTED_POSTS') {
        //     promise = getUserVotedPolls(this.props.username, page, size);
        // }
        // else if (this.props.type === 'SEARCH_POST') {
        //     promise = getAllPollsSearch(this.props.match.params.search, page, size);
        // }
        // else {
        //     promise = getAllPolls(page, size);
        // }

        if (!promise) {
            return;
        }

        promise
            .then(response => {
                //console.log(response);

                const posts = this.state.posts.slice();

                const currentVotes = this.state.currentVotes.slice();

                const currentVotes2 = currentVotes.concat(Array(response.content.length).fill(null))
                const comments = this.state.comments.slice().concat(Array(response.content.length).fill([]));
                const submittingComment = this.state.submittingComment.slice().concat(Array(response.content.length).fill(false));
                const valueComment = this.state.valueComment.slice().concat(Array(response.content.length).fill(''));
                const showComment = this.state.showComment.slice().concat(Array(response.content.length).fill(false));
                const showReply = this.state.showReply.slice().concat(Array(response.content.length).fill([]));
                const valueReply = this.state.valueReply.slice().concat(Array(response.content.length).fill(''));
                const submittingReply = this.state.submittingReply.slice().concat(Array(response.content.length).fill([]));
                const pageComment = this.state.pageComment.slice().concat(Array(response.content.length).fill(0));
                const isLastComment = this.state.isLastComment.slice().concat(Array(response.content.length).fill(false));
                response.content.forEach((post, index) => {
                    // if (this.props.isAuthenticated) {
                    //     this.state.stompClient.send('/app/start', {}, post.id);
                    // }
                    currentVotes2[posts.length + index] = Array(post.polls.length).fill(null)
                })
                posts.concat(response.content)
                // posts.concat(response.content).forEach((post, index) => {
                //     if (this.props.isAuthenticated) {
                //         this.state.stompClient.send('/app/start', {}, post.id);
                //     }
                //     currentVotes2[index] = Array(post.polls.length).fill(null)
                // })
                //console.log(this.state.page)
                //console.log(response.page)
                // console.log(this.state.check)
                if (this.state.page === response.page && this.state.check === 0) {
                    if (this._isMounted) {
                        //console.log("setState1")
                        this.setState({
                            posts: posts.concat(response.content),
                            page: response.page,
                            size: response.size,
                            totalElements: response.totalElements,
                            totalPages: response.totalPages,
                            last: response.last,
                            currentVotes: currentVotes2,
                            isLoading: false,
                            check: 1,
                            comments: comments,
                            submittingComment: submittingComment,
                            valueComment: valueComment,
                            showComment: showComment,
                            showReply: showReply,
                            valueReply: valueReply,
                            submittingReply: submittingReply,
                            pageComment: pageComment,
                            isLastComment: isLastComment
                        })
                    }
                }
                else if (this.state.page !== response.page) {
                    if (this._isMounted) {
                        //console.log("setState2")
                        this.setState({
                            posts: posts.concat(response.content),
                            page: response.page,
                            size: response.size,
                            totalElements: response.totalElements,
                            totalPages: response.totalPages,
                            last: response.last,
                            currentVotes: currentVotes2,
                            isLoading: false,
                            check: 0,
                            comments: comments,
                            submittingComment: submittingComment,
                            valueComment: valueComment,
                            showComment: showComment,
                            showReply: showReply,
                            valueReply: valueReply,
                            submittingReply: submittingReply,
                            pageComment: pageComment
                        })
                    }
                }



            }).catch(error => {
                if (this._isMounted) {
                    this.setState({
                        isLoading: false
                    })
                }
            });

    }
    componentWillUnmount() {
        this._isMounted = false;
        if (this.state.stompClient != null) {
            //console.log("disccccccccccccccccccccccco")
            this.state.stompClient.send('/app/stop', {});
            this.state.stompClient.disconnect();
        }
        //console.log("unmount")
    }
    socketPoll = (data) => {
        const posts = this.state.posts.slice();

        switch (data.type) {
            case 1://Vote + delete vote
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        post.polls.some((poll, pollIndex) => {
                            if (poll.id === data.pollId) {
                                posts[postIndex].polls[pollIndex].totalVotes = data.totalVotes;
                                data.choices.forEach((choiceSocket) => {
                                    poll.choices.some((choice, choiceIndex) => {
                                        if (choice.id === choiceSocket.id) {
                                            choiceSocket.userVoteCount = choice.userVoteCount;
                                            posts[postIndex].polls[pollIndex].choices[choiceIndex] = {
                                                ...posts[postIndex].polls[pollIndex].choices[choiceIndex],
                                                ...choiceSocket
                                            }
                                        }
                                        return choice.id === choiceSocket.id;
                                    })
                                })
                            }
                            return poll.id === data.pollId;
                        })
                    }
                    return post.id === data.postId;
                })
                
                break;
            case 2://end poll
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        post.polls.some((poll, pollIndex) => {
                            if (poll.id === data.pollId) {
                                posts[postIndex].polls[pollIndex].isExpired = data.isExpired;
                                posts[postIndex].polls[pollIndex].expirationDateTime = data.expirationDateTime;
                            }
                            return poll.id === data.pollId;
                        })
                    }
                    return post.id === data.postId;
                })
                break;
            case 3://add choice
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        post.polls.some((poll, pollIndex) => {
                            if (poll.id === data.pollId) {
                                posts[postIndex].polls[pollIndex].choices = posts[postIndex].polls[pollIndex].choices.concat(data.choices[0]);
                            }
                            return poll.id === data.pollId;
                        })
                    }
                    return post.id === data.postId;
                })
                break;
            case 4: //delete choice
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        post.polls.some((poll, pollIndex) => {
                            if (poll.id === data.pollId) {
                                poll.choices.some((choice, choiceIndex) => {
                                    if (choice.id === data.choiceId) {
                                        posts[postIndex].polls[pollIndex].totalVotes = posts[postIndex].polls[pollIndex].totalVotes - posts[postIndex].polls[pollIndex].choices[choiceIndex].voteCount;
                                        posts[postIndex].polls[pollIndex].choices.splice(choiceIndex, 1);
                                    }
                                    return choice.id === data.choiceId;
                                })
                            }
                            return poll.id === data.pollId;
                        })
                    }
                    return post.id === data.postId;
                })
                break;
            case 5: //Like post
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        posts[postIndex].totalLike++;
                    }
                    return post.id === data.postId;
                })
                break;
            case 6: //UnLike post
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        posts[postIndex].totalLike--;
                    }
                    return post.id === data.postId;
                })
                break;
            case 7: //Comment post
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        posts[postIndex].totalComment++;
                        if (this.state.showComment[postIndex]) {
                            const comments = this.state.comments.slice();
                            comments[postIndex] = comments[postIndex].concat(data.comment);
                            this.setState({
                                comments: comments
                            })
                        }
                    }
                    return post.id === data.postId;
                })
                break;
            case 8: //Reply post
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        //posts[postIndex].totalComment++;
                        if (this.state.showComment[postIndex]) {
                            const comments = this.state.comments.slice();
                            comments[postIndex].some((comment, commentIndex) => {
                                if (comment.id === data.reply.commentId) {
                                    comments[postIndex][commentIndex].replys = comments[postIndex][commentIndex].replys.concat(data.reply);
                                    this.setState({
                                        comments: comments
                                    })
                                }
                                return comment.id === data.reply.commentId;
                            })
                            //    comments[postIndex] = comments[postIndex].concat(data.comment); 
                            //    this.setState({
                            //         comments : comments
                            //     })
                        }
                    }
                    return post.id === data.postId;
                })
                break;
            case 9:
                posts.some((post, postIndex) => {
                    if (post.id === data.postId) {
                        posts[postIndex].question = data.name;
                    }
                    return post.id === data.postId;
                })
                break;
            case 10:
                notification.info({
                    message: `Notification`,
                    description:
                      data.name,
                      placement: "bottomLeft",
                      onClick: ()=>this.props.history.push("/post/"+data.postId)
                  });
                  break;
            default:

        }
        if (this._isMounted) {
            this.setState({
                posts: posts
            })
        }
    }
    onFollowPost = (postIndex) => {
        const post = this.state.posts;
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to follow.",
            });
            return;
        }
        savePost(post[postIndex].id)
            .then(response => {
                post[postIndex].isUserStorage = true;
                this.setState({
                    posts: post
                })
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Sorry! Something went wrong. Please try again!'
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
    }
    deleteFollowPost = (postIndex) => {
        const post = this.state.posts;
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to follow.",
            });
            return;
        }
        deleteSavePost(post[postIndex].id)
            .then(response => {
                post[postIndex].isUserStorage = false;
                this.setState({
                    posts: post
                })
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Sorry! Something went wrong. Please try again!'
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
    }
    onLikePost = (postIndex) => {
        const post = this.state.posts[postIndex];
        // if (this.props.isAuthenticated) {
        //     this.state.stompClient.send('/app/start', {}, post.id);
        // }
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to like.",
            });
            return;
        }
        castLike(post.id)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[postIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
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
    }
    showModalDeletePost = (postIndex) => {
        if (this._isMounted) {
            this.setState({
                visiblePost: true,
                currentPostIndex: postIndex
            })
        }
    }
    handleDeletePostSubmit = () => {
        const post = this.state.posts[this.state.currentPostIndex];
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to delete.",
            });
            return;
        }
        deletePost(post.id)
            .then(response => {
                const posts = this.state.posts.slice();
                posts.splice(this.state.currentPostIndex, 1);
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Successfully!!'
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
                visiblePost: false
            });
        }
    }
    componentDidMount() {
        // console.log("didmount")
        // console.log(this.props.taolao!==true);
        this._isMounted = true;
        if (this.props.isAuthenticated&&this.state.stompClient==null) {
            if(this.props.socket!==true){
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
        }
        this.loadPostList(this.state.page);

        // else {
        //     if(this.state.stompClient!=null){
        //         console.log("disccccccccccccccccccccccco")
        //         this.state.stompClient.disconnect();
        //     }
        // }

        //return ()=> stompClient && stompClient.disconnect();
        // var options = {
        //     root: null,
        //     rootMargin: "0px",
        //     threshold: 0.75
        // };

        // this.observer = new IntersectionObserver(
        //     this.handleObserver.bind(this),
        //     options
        // );
        // this.observer.observe(this.loadingRef);
    }
    // handleObserver = (entities, observer) => {
    //     const y = entities[0].boundingClientRect.y;
    //     console.log(y);
    //     console.log(this.state.prevY);
    //     if (this.state.prevY > y) {
    //         this.loadPostList(this.state.page + 1);
    //     } if (this._isMounted) {
    //         this.setState({ prevY: y });
    //     }
    // }
    componentDidUpdate(nextProps) {
        //console.log("didupdate")
        if (this.props.isAuthenticated !== nextProps.isAuthenticated || this.props.match.params.code !== nextProps.match.params.code) {
            // Reset State 
            //console.log("next")
            // if (this._isMounted) {
            this.setState({
                posts: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: false,
                currentVotes: [],
                isLoading: false,
                visible: false,
                currentPollIndex: 0,
                currentPostIndex: 0,
                currentValue: '',
                prevY: 0,
                visibleListVoted: false,
                votedUsers: [],
                pageVoted: 0,
                currentChoiceId: 0,
                isLoading2: false,
                last2: false,
                check: 0,
                visiblePost: false
            });
            // if (this.state.stompClient != null) {
            //     //console.log("disccccccccccccccccccccccco")
            //     this.state.stompClient.send('/app/stop', {});
            //     this.state.stompClient.disconnect();
            // }
            this.loadPostList();
            // }

        }
    }

    handleLoadMore = (page) => {
        //console.log(page);
        //console.log(this.state.isLoading)
        this.loadPostList(page);
    }
    handleLoadMoreUserVoted = () => {
        this.loadListVoted(this.state.currentChoiceId, this.state.pageVoted + 1)
    }
    handleVoteChange(event, pollIndex, postIndex) {
        const currentVotes = this.state.currentVotes.slice();
        currentVotes[postIndex][pollIndex] = event.target.value;
        if (this._isMounted) {
            this.setState({
                currentVotes: currentVotes
            });
        }
    }


    handleVoteSubmit(event, pollIndex, postIndex) {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to vote.",
            });
            return;
        }

        const poll = this.state.posts[postIndex].polls[pollIndex];
        const selectedChoice = this.state.currentVotes[postIndex][pollIndex];

        const voteData = {
            pollId: poll.id,
            choiceId: selectedChoice
        };

        castVote(voteData)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[postIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
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
    }
    handleCancel = () => {
        if (this._isMounted) {
            this.setState({
                visible: false,
                currentPollIndex: 0,
                currentPostIndex: 0,
                currentValue: ''
            })
        }
    }
    handleCancelComment = () => {
        if (this._isMounted) {
            this.setState({
                visibleCommentDelete: false,
                currentCommentIndex: 0,
                currentPostIndex: 0,
            })
        }
    }
    handleCancelReply = () => {
        if (this._isMounted) {
            this.setState({
                visibleReplyDelete: false,
                currentCommentIndex: 0,
                currentPostIndex: 0,
                currentReplyIndex: 0
            })
        }
    }
    handleCancelPost = () => {
        if (this._isMounted) {
            this.setState({
                visiblePost: false,
                currentPostIndex: 0
            })
        }
    }
    handleCancelListVoted = () => {
        if (this._isMounted) {
            this.setState({
                visibleListVoted: false,
                votedUsers: [],
                isLoading2: false,
                last2: false
            })
        }
    }
    loadListVoted = (choiceId, page = 0, size = USER_LIST_SIZE) => {
        if (this._isMounted) {
            this.setState({
                isLoading2: true
            })
        }

        //     if (this._isMounted) {
        //         this.setState({
        //             posts: posts.concat(response.content),
        //             page: response.page,
        //             size: response.size,
        //             totalElements: response.totalElements,
        //             totalPages: response.totalPages,
        //             last: response.last,
        //             currentVotes: currentVotes2,
        //             isLoading: false
        //         })
        //     }
        // }
        getAllUserVotedChoice(choiceId, page, size)
            .then(response => {
                const votedUsers = this.state.votedUsers.slice();
                if (this.state.last2 !== true) {
                    if (this._isMounted) {
                        this.setState({
                            votedUsers: votedUsers.concat(response.content),
                            currentChoiceId: choiceId,
                            pageVoted: page,
                            last2: response.last,
                            isLoading2: false
                        });
                    }
                }
            }).catch(error => {
                if (error.status === 401) {
                    this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
                } else {
                    notification.error({
                        message: 'Polling App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });
                }
                if (this._isMounted) {
                    this.setState({
                        isLoading2: false
                    })
                }
            });
    }
    showModalListVoted = (choiceId, page = 0, size = USER_LIST_SIZE) => {
        if (this._isMounted) {
            this.setState({
                visibleListVoted: true
            })
        }
        this.loadListVoted(choiceId, page, size);
    }

    showModal = (event, postIndex, pollIndex) => {
        if (this._isMounted) {
            this.setState({
                visible: true,
                currentPollIndex: pollIndex,
                currentPostIndex: postIndex,
                currentValue: event.currentTarget.value
            })
        }
    }
    showModalComment = ( postIndex, commentIndex) => {
        console.log(commentIndex);
        console.log(postIndex);
        if (this._isMounted) {
            this.setState({
                visibleCommentDelete: true,
                currentPostIndex: postIndex,
                currentCommentIndex: commentIndex
            })
        }
    }
    showModalReply = ( postIndex, commentIndex , replyIndex) => {
        console.log(commentIndex);
        console.log(postIndex);
        console.log(replyIndex);
        if (this._isMounted) {
            this.setState({
                visibleReplyDelete: true,
                currentPostIndex: postIndex,
                currentCommentIndex: commentIndex,
                currentReplyIndex: replyIndex
            })
        }
    }
    handleDeleteVoteSubmit = (event, postIndex, pollIndex) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to delete.",
            });
            return;
        }

        const poll = this.state.posts[postIndex].polls[pollIndex];
        const selectedChoice = event.currentTarget.value;

        const voteData = {
            choiceId: selectedChoice
        };

        deleteVote(poll.id, voteData)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[postIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
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
    }
    onEndPoll = (event, postIndex, pollIndex) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to update.",
            });
            return;
        }

        const poll = this.state.posts[postIndex].polls[pollIndex];

        endPoll(poll.id)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[postIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
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
    }
    handleDeleteChoiceSubmit = (event) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to delete.",
            });
            return;
        }

        const poll = this.state.posts[this.state.currentPostIndex].polls[this.state.currentPollIndex];

        const voteData = {
            choiceId: this.state.currentValue
        };

        deleteChoice(poll.id, voteData)
            .then(response => {
                const posts = this.state.posts.slice();
                posts[this.state.currentPostIndex] = response;
                if (this._isMounted) {
                    this.setState({
                        posts: posts
                    });
                }
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
                visible: false
            });
        }
    }
    
    handleDeleteCommentSubmit = (event) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to delete.",
            });
            return;
        }
        const postIndex = this.state.currentPostIndex;
        const commentIndex = this.state.currentCommentIndex;
        const comment = this.state.comments.slice();
        const posts = this.state.posts.slice();
        deleteComment(posts[postIndex].id,comment[postIndex][commentIndex].id)
            .then(response => {
                posts[postIndex].totalComment--;
                comment[postIndex].splice(commentIndex,1);
                if (this._isMounted) {
                    this.setState({
                        posts: posts,
                        comments: comment
                    });
                }
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Delete comment success!'
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
                visibleCommentDelete: false
            });
        }
    }
    handleDeleteReplySubmit = (event) => {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to delete.",
            });
            return;
        }
        const postIndex = this.state.currentPostIndex;
        const commentIndex = this.state.currentCommentIndex;
        const replyIndex = this.state.currentReplyIndex;
        const comment = this.state.comments.slice();
        const posts = this.state.posts.slice();
        deleteReply(posts[postIndex].id,comment[postIndex][commentIndex].id,comment[postIndex][commentIndex].replys[replyIndex].id)
            .then(response => {
                comment[postIndex][commentIndex].replys.splice(replyIndex,1);
                if (this._isMounted) {
                    this.setState({
                        comments: comment
                    });
                }
                notification.success({
                    message: 'Polling App',
                    description: response.message || 'Delete comment success!'
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
                visibleReplyDelete: false
            });
        }
    }
    updateName = (value, index) => {
        const posts = this.state.posts;
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to update.",
            });
            return;
        }
        updatePostName(posts[index].id, value)
            .then(response => {
                notification.success({
                    message: 'Polling App',
                    description: "Thank you! You're successfully update post name!",
                });
                posts[index].question = value;
                this.setState({
                    posts: posts
                })
                this.props.history.push("/post/" + posts[index].id);
            }).catch(error => {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });


    }
    render() {
        const style = {
            height: 40,
            width: 40,
            lineHeight: '40px',
            borderRadius: 4,
            backgroundColor: '#fff',
            color: 'rgb(0 0 0)',
            textAlign: 'center',
            fontSize: 14,
            boxShadow: '0 2px 2px 0 rgb(0 0 0 / 16%), 0 0 0 1px rgb(0 0 0 / 8%)',
        };
        const postViews = [];
        this.state.posts.forEach((post, postIndex) => {
            postViews.push(<Post
                // onChangeNamePost = {this.onChangeNamePost}
                onLoadMoreComment = {this.onLoadMoreComment}
                onDeleteReply = {this.showModalReply}
                onDeleteComment = {this.showModalComment}
                showComment={this.state.showComment[postIndex]}
                comments={this.state.comments[postIndex]}
                pageComment={this.state.pageComment[postIndex]}
                isLastComment={this.state.isLastComment[postIndex]}
                submittingComment={this.state.submittingComment[postIndex]}
                valueComment={this.state.valueComment[postIndex]}
                showReply={this.state.showReply[postIndex]}
                valueReply={this.state.valueReply[postIndex]}
                submittingReply={this.state.submittingReply[postIndex]}
                handleChangeComment={this.handleChangeComment}
                handleSubmitComment={this.handleSubmitComment}
                onComment={this.onComment}
                onReply={this.onReply}
                handleChangeReply={this.handleChangeReply}
                handleSubmitReply={this.handleSubmitReply}
                updateName={this.updateName}
                onFollowPost={this.onFollowPost}
                deleteFollowPost={this.deleteFollowPost}
                onDeletePost={this.showModalDeletePost}
                onLikePost={this.onLikePost}
                currentUser={this.props.currentUser}
                key={post.id}
                post={post}
                currentVote={this.state.currentVotes[postIndex]}
                postIndex={postIndex}
                addAChoice={this.addAChoice}
                handleDeleteChoiceSubmit={this.showModal}
                handleShowListVoted={this.showModalListVoted}
                handleDeleteVoteSubmit={this.handleDeleteVoteSubmit}
                onEndPoll={this.onEndPoll}
                handleVoteChange={this.handleVoteChange}
                handleVoteSubmit={this.handleVoteSubmit} />)
        });
        // const votedUsers = [];
        // this.state.votedUsers.forEach((user, userIndex) => {
        //     const title = user.name + ' @ ' + user.username;
        //     const des = "Voted :" + user.count;
        //     votedUsers.push(
        // <Card >
        //     <Meta
        //       avatar={
        //         <Avatar
        //                     style={{ backgroundColor: getAvatarColor(user.name) }} >
        //                     {user.name[0].toUpperCase()}
        //                 </Avatar>
        //       }
        //       title=  {title}
        //       description={des}
        //     />
        //   </Card>
        // <div className="poll-creator-info">
        //     <Link className="creator-link" to={`/users/${user.username}`}>
        //         <Avatar className="poll-creator-avatar"
        //             style={{ backgroundColor: getAvatarColor(user.name) }} >
        //             {user.name[0].toUpperCase()}
        //         </Avatar>
        //         <span className="poll-creator-name">
        //             {user.name}
        //         </span>
        //         <span className="poll-creator-username">
        //             @{user.username}
        //         </span>
        //     </Link>
        //     <span className="poll-creation-date">
        //         Voted: {user.count}
        //     </span>
        // </div>

        //     )
        // })
        // votedUsers.push(<div>
        //     {
        //         !this.state.isLoadingVoted && !this.state.lastVoted ? (
        //             <div className="load-more-polls">
        //                 <Button type="dashed" onClick={this.handleLoadUserVotedMore} disabled={this.state.isLoadingVoted}>
        //                     <Icon type="plus" /> Load more
        //                 </Button>
        //             </div>) : null
        //     }</div>
        // )
        return (
            <div className="polls-container">
                <Modal
                    title="Confirm your action"
                    visible={this.state.visible}
                    onOk={this.handleDeleteChoiceSubmit}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Return
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.handleDeleteChoiceSubmit}>
                            Submit
                        </Button>,
                    ]}
                ><p>Are you want delete this choice?</p>
                </Modal>
                <Modal
                    title="Confirm your action"
                    visible={this.state.visibleReplyDelete}
                    onOk={this.handleDeleteReplySubmit}
                    onCancel={this.handleCancelReply}
                    footer={[
                        <Button key="back" onClick={this.handleCancelReply}>
                            Return
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.handleDeleteReplySubmit}>
                            Submit
                        </Button>,
                    ]}
                ><p>Are you want delete this reply?</p>
                </Modal>
                <Modal
                    title="Confirm your action"
                    visible={this.state.visiblePost}
                    onOk={this.handleDeletePostSubmit}
                    onCancel={this.handleCancelPost}
                    footer={[
                        <Button key="back" onClick={this.handleCancelPost}>
                            Return
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.handleDeletePostSubmit}>
                            Submit
                        </Button>,
                    ]}
                ><p>Are you want delete this post?</p>
                </Modal>
                <Modal
                    title="Confirm your action"
                    visible={this.state.visibleCommentDelete}
                    onOk={this.handleDeleteCommentSubmit}
                    onCancel={this.handleCancelComment}
                    footer={[
                        <Button key="back" onClick={this.handleCancelComment}>
                            Return
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.handleDeleteCommentSubmit}>
                            Submit
                        </Button>,
                    ]}
                ><p>Are you want delete this comment?</p>
                </Modal>
                <Modal
                    title="List User Voted This Choice"
                    centered
                    visible={this.state.visibleListVoted}
                    onCancel={this.handleCancelListVoted}

                    footer={[
                        <Button key="back" onClick={this.handleCancelListVoted}>
                            Return
                        </Button>,
                    ]}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.votedUsers}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={item.photo == null ?
                                        <Avatar className="poll-creator-avatar2"
                                            style={{ backgroundColor: getAvatarColor(item.name) }} >
                                            {item.name[0].toUpperCase()}
                                        </Avatar> : <Avatar className="poll-creator-avatar2"
                                            //src={API_BASE_URL + "/file/getImage/" + item.photo} 
                                            src={"https://drive.google.com/uc?export=view&id="+item.photo}
                                            >
                                        </Avatar>
                                    }
                                    title={<div>{item.name} <span style={{ color: '#657786' }}>@{item.username}</span></div>}
                                    description={<span>Voted: {item.count}</span>}
                                />
                            </List.Item>
                        )}
                    />
                    {
                        !this.state.isLoading2 && !this.state.last2 ? (
                            <div className="load-more-polls">
                                <Button type="dashed" onClick={this.handleLoadMoreUserVoted} disabled={this.state.isLoading2}>
                                    <PlusOutlined /> Load more
                                </Button>
                            </div>) : null
                    }
                    {
                        this.state.isLoading2 ?
                            <LoadingIndicator /> : null
                    }
                </Modal>
                <InfiniteScroll
                    initialLoad={false}
                    pageStart={this.state.page}
                    loadMore={this.handleLoadMore}
                    hasMore={!this.state.isLoading && !this.state.last}
                    // hasMore={true}
                    threshold={1500}
                    useWindow={true}
                >
                    {postViews}
                    {this.state.isloading && (
                        <div className="demo-loading-container">
                            <LoadingIndicator />
                        </div>
                    )}
                </InfiniteScroll>
                {/* <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleLoadMore}
                    hasMore={!this.state.isloading}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    // hasMore={true}
                    useWindow={true}
                >
                    {postViews}
                    {this.state.isloading &&  (
                        <div className="demo-loading-container">
                            <LoadingIndicator />
                        </div>
                    )}
                </InfiniteScroll> */}
                {/* {
                    !this.state.isLoading && this.state.posts.length === 0 ? (
                        <div className="no-polls-found">
                            <span>No Polls Found.</span>
                        </div>
                    ) : null
                }

                <div
                    ref={(loadingRef) => (this.loadingRef = loadingRef)}

                >
                    {
                        !this.state.isLoading && !this.state.last ? (
                            <div className="load-more-polls">
                                <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                    <PlusOutlined /> Load more
                                </Button>
                            </div>) : null
                    }
                </div>
                {
                    this.state.isLoading ?
                        <LoadingIndicator /> : null
                } */}
                <BackTop>
                    <div style={style}><VerticalAlignTopOutlined /></div>
                </BackTop>
            </div>
        );
    }
}

export default withRouter(PostList);