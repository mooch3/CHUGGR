const firestore = firebase.firestore();
const renderChatBox = document.getElementById('renderChatBox')
  // retrieve latest messages from firestore and order by time stamp
if(renderChatBox != null){

  // load messages when the page is called, then only listen for changes (not all documents)
  const currentUser = document.getElementById('currentUser').value;
  const userRef = firestore.collection('users').doc(currentUser)
  const betID = document.getElementById('betID').value;
  const chatRef = firestore.collection('chatRooms').doc(betID);
  const send = document.getElementById('sendMessage');
  const inputRef = document.getElementById('chatValue')

  inputRef.addEventListener('keypress', (e)=> {
    if (e.keyCode === 13){
      e.preventDefault();
      send.click();
      const chatbox = document.getElementById('chat-message-container')
      chatbox.scrollTop = chatbox.scrollHeight - chatbox.clientHeight;
    }
  });
  send.addEventListener('click', (e) => {
    const input = document.getElementById('chatValue').value;
      userRef.get().then((doc) => {
        const message = {
          body: input,
          timestamp: Date.now()/1000,
          userName: doc.data().userName,
          uid: doc.data().uid
        };

        sendMessage(message);

      });
   document.getElementById('chatValue').value = '';
  });


  function sendMessage(message) {
    // TODO: do I want to send messages from client side or back end?
    chatRef.collection('actualMessages').doc().set(message).then(() => {
      console.log('message sent!');
    });


  };

  getRealtimeChat = function() {
    const orderChat = firestore.collection('chatRooms')
                               .doc(betID)
                               .collection('actualMessages')
                               .orderBy('timestamp');

    orderChat.onSnapshot((snapshot) => {

      snapshot.docChanges().forEach((change) => {
        // render messages to client side
        if (change.type == 'added') {

          let chatMessageContainer = document.getElementById('chat-message-container');
          let firstDiv = document.createElement('Div');
          firstDiv.className = 'message-box-holder';
          let firstDiv2 = document.createElement('Div');
          firstDiv2.className = 'message-box-holder';
          let secondDiv = document.createElement('Div');
          secondDiv.className = 'message-box';
          let sender = document.createElement('Div');
          sender.className = 'message-sender';
          let node = document.createTextNode(change.doc.data().body);

          if (change.doc.data().uid == currentUser) {

            chatMessageContainer.appendChild(firstDiv);
            firstDiv.appendChild(secondDiv);
            secondDiv.appendChild(node);
          } else {

            let senderNode = document.createTextNode(change.doc.data().userName);

            chatMessageContainer.appendChild(firstDiv);
            firstDiv.appendChild(sender);
            sender.appendChild(senderNode);
            secondDiv.classList.add('message-partner');
            firstDiv.appendChild(secondDiv);
            secondDiv.appendChild(node)
          };
        };
      });
    });

  };
  // set listener
  getRealtimeChat();
}