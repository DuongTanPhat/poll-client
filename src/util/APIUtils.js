import { API_BASE_URL, POLL_LIST_SIZE,USER_LIST_SIZE, ACCESS_TOKEN,GROUP_LIST_SIZE } from '../constants';
const request = (options) => {
    const headers = new Headers({
        'Content-Type': 'application/json'
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};
const request2 = (options) => {
    const headers = new Headers({
        'Accept': '*/*',
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};
export function getAllPolls(page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/polls?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getAllPollsSearch(search,page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/polls/search?search="+search+"&page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getOnePolls(id) {
    return request({
        url: API_BASE_URL + "/polls/" + id,
        method: 'GET'
    });
}
export function updatePostName(postId,name) {
    return request({
        url: API_BASE_URL + "/polls/" + postId+"?name="+name,
        method: 'PUT'
    });
}
export function getAllPollsOfGroup(code,page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/groups/polls?code="+code+"&page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getAllGroups(page, size) {
    page = page || 0;
    size = size || GROUP_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/groups?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getAllUserVotedChoice(choice,page, size) {
    page = page || 0;
    size = size || USER_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/polls/voted?choice="+choice+"&page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getAllComment(postId,page, size) {
    page = page || 0;
    size = size || USER_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/polls/"+postId+"/comment?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function commentPost(postId,text) {

    return request({
        url: API_BASE_URL + "/polls/"+postId+"/comment?text=" + text,
        method: 'POST'
    });
}
export function replyComment(postId,commentId,text) {

    return request({
        url: API_BASE_URL + "/polls/"+postId+"/comment/"+commentId+"?text=" + text,
        method: 'POST'
    });
}
export function createPoll(pollData) {
    return request({
        url: API_BASE_URL + "/polls",
        method: 'POST',
        body: JSON.stringify(pollData)         
    });
}

export function castVote(voteData) {
    return request({
        url: API_BASE_URL + "/polls/" + voteData.pollId + "/votes",
        method: 'POST',
        body: JSON.stringify(voteData)
    });
}

export function deleteVote(pollId,deleteData) {
    return request({
        url: API_BASE_URL + "/polls/" + pollId + "/deletevotes",
        method: 'POST',
        body: JSON.stringify(deleteData)
    });
}
export function deleteChoice(pollId,deleteData) {
    return request({
        url: API_BASE_URL + "/polls/" + pollId + "/deletechoice",
        method: 'POST',
        body: JSON.stringify(deleteData)
    });
}
export function endPoll(pollId) {
    return request({
        url: API_BASE_URL + "/polls/" + pollId + "/endpoll",
        method: 'PUT'
    });
}
export function addChoice(addData,pollId) {
    return request({
        url: API_BASE_URL + "/polls/" + pollId + "/addchoice",
        method: 'POST',
        body: JSON.stringify(addData)
    });
}

export function castLike(postId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId+"/like",
        method: 'POST'
    });
}

export function deletePost(postId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId,
        method: 'DELETE'
    });
}

export function deleteComment(postId,commentId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId+"/comment/"+commentId,
        method: 'DELETE'
    });
}

export function deleteReply(postId,commentId,replyId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId+"/comment/"+commentId+"/reply/"+replyId,
        method: 'DELETE'
    });
}
export function savePost(postId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId+"/save",
        method: 'POST'
    });
}
export function deleteSavePost(postId) {
    return request({
        url: API_BASE_URL + "/polls/" +postId+"/save",
        method: 'DELETE'
    });
}

export function login(loginRequest) {
    return request({
        url: API_BASE_URL + "/auth/signin",
        method: 'POST',
        body: JSON.stringify(loginRequest)
    });
}

export function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "/auth/signup",
        method: 'POST',
        body: JSON.stringify(signupRequest)
    });
}

export function createGroup(groupData) {
    return request({
        url: API_BASE_URL + "/groups",
        method: 'POST',
        body: JSON.stringify(groupData)
    });
}
export function createPollPhoto(imageData) {
        return request2({
            url: API_BASE_URL + "/polls",
            method: 'POST',
            body: imageData
        });
    }
export function changeAvatar(imageData) {
    return request2({
        url: API_BASE_URL + "/file/useravatar",
        method: 'POST',
        body: imageData
    });
}
export function uploadImage(imageData) {
    return request2({
        url: API_BASE_URL + "/file/upload",
        method: 'POST',
        body: imageData
    });
}
export function deleteImage(id) {
    return request2({
        url: API_BASE_URL + "/file/upload?id="+id,
        method: 'DELETE'
    });
}
export function getImage(filename) {
    return request({
        url: API_BASE_URL + "/file/getImage/" + filename,
        method: 'GET'
    });
}

export function checkUsernameAvailability(username) {
    return request({
        url: API_BASE_URL + "/user/checkUsernameAvailability?username=" + username,
        method: 'GET'
    });
}

export function checkEmailAvailability(email) {
    return request({
        url: API_BASE_URL + "/user/checkEmailAvailability?email=" + email,
        method: 'GET'
    });
}
export function checkGroupCodeAvailability(code) {
    return request({
        url: API_BASE_URL + "/groups/checkGroupCodeAvailability?code=" + code,
        method: 'GET'
    });
}

export function getCurrentUser() {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/user/me",
        method: 'GET'
    });
}

export function getListUser(user,type) {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/user/find?"+type+"="+user,
        method: 'GET'
    });
}

export function getListGroup(name) {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/groups/find?name="+name,
        method: 'GET'
    });
}
export function getGroup(code) {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/groups/edit?code="+code,
        method: 'GET'
    });
}
export function getListUserForAddGroup(username,code) {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/groups/findadd?username="+username+"&code="+code,
        method: 'GET'
    });
}
export function editGroup(groupData) {
    return request({
        url: API_BASE_URL + "/groups/edit",
        method: 'POST',
        body: JSON.stringify(groupData)
    });
}
export function deleteUserGroup(groupId,userId) {
    return request({
        url: API_BASE_URL + "/groups/"+groupId+"/user?user="+userId,
        method: 'DELETE'
    });
}
export function leaveGroup(groupId) {
    return request({
        url: API_BASE_URL + "/groups/"+groupId+"/leave",
        method: 'DELETE',
    });
}
export function deleteGroup(groupId) {
    return request({
        url: API_BASE_URL + "/groups/"+groupId,
        method: 'DELETE',
    });
}
export function getUserProfile(username) {
    return request({
        url: API_BASE_URL + "/users/" + username,
        method: 'GET'
    });
}
export function changePassword(passwordData) {
    return request({
        url: API_BASE_URL + "/user/changepassword",
        method: 'PUT',
        body: JSON.stringify(passwordData)
    });
}
export function changeName(name) {
    return request({
        url: API_BASE_URL + "/user/me?name="+name,
        method: 'PUT'
    });
}

export function getUserCreatedPolls(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/polls?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function getUserVotedPolls(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/votes?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getUserSavedPolls(page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/savepost?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function getUserNotification(page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/notification?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
export function readNotification(id) {
    return request({
        url: API_BASE_URL + "/users/notification?id=" + id,
        method: 'PUT'
    });
}
export function confirmMail(code) {
    return request({
        url: API_BASE_URL + "/auth/active?token=" + code,
        method: 'GET'
    });
}