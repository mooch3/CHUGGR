const fieldValue = firebase.firestore.FieldValue;
const betID = document.getElementById('betID').value;
const currentUser = document.getElementById('currentUser').value;
const closeBetButton = document.getElementById('closeBetButton');
const oustandingBetButton = document.getElementById('outstandingBetButton');
const uninvitedUser = firestore.collection('testUsers').doc(currentUser);
const joinBet = document.getElementById('joinBet');
const betRef = firestore.collection('testBets').doc(betID);

if (joinBet != null){
  uninvitedUser.get().then((doc) => {
      const joinBetButton = document.getElementById('joinBetButton');
      console.log(doc.data().userName)
      joinBetButton.addEventListener('click', (e) => {
        const joinSideOne = document.getElementById('joinSideOne');
        const joinSideTwo = document.getElementById('joinSideTwo');
      
        if (joinSideOne.checked === true){
          betRef.set({
            side1Users: {
              [currentUser]: doc.data().userName,
            }
          }, {
            merge: true
          });
          incrementBetTotal();
          moveToAcceptedUsers(betRef);
          addToAllUsers(betRef)
          console.log('You joined side 1')
          setTimeout(() => {
            location.reload()
          }, 800);
        } else if (joinSideTwo.checked === true){
          betRef.set({
            side2Users: {
              [currentUser]: doc.data().userName,
            },
          }, {
            merge: true
          });
          incrementBetTotal();
          moveToAcceptedUsers(betRef);
          addToAllUsers(betRef)
          console.log('You joined side 2')
          setTimeout(() => {
            location.reload()
          }, 800);
        }
      })
  })
};


betRef.get().then((doc) => {
  if (closeBetButton != null) {
    console.log(doc.data());
    closeBetButton.addEventListener('click', (e) => {
      const side1 = document.getElementById('side1UsersSelect');
      const side2 = document.getElementById('side2UsersSelect');
      closeBet(doc, side1, side2);
    });
  } else if (oustandingBetButton != null) {
    outstandingBetButton.addEventListener('click', (e) => {
      const outstanding = document.getElementById('outstandingBtnSelect');
      moveOutOfOutstanding();
      decrementOutstanding(doc)
      console.log('User moved out of oustanding.');
    });
  };
});

function closeBet(doc, side1, side2) {

  let beers = doc.data().stake.beers;
  let shots = doc.data().stake.shots;

  if (side1.checked == true) {
    side1Winners();
    let winnersCircle = doc.data().side1Users;
    let losersCircle = doc.data().side2Users;

    for (const winner in winnersCircle) {
      incrementWinners(winner, beers, shots);
    }

    for (const loser in losersCircle) {
      incrementLosers(loser, beers, shots);
      moveToOutStanding(loser);
    }

  } else if (side2.checked == true) {
    side2Winners();
    let winnersCircle = doc.data().side2Users;
    let losersCircle = doc.data().side1Users;

    for (const winner in winnersCircle) {
      incrementWinners(winner, beers, shots);
    };
    for (const loser in losersCircle) {
      incrementLosers(loser, beers, shots);
      moveToOutStanding(loser);
    };


  }
  removeInvitedUsers();
  finished();

  setTimeout(() => {
    location.reload();
  }, 800);

  console.log('bet closed successfully');
};

function incrementWinners(winner, beers, shots) {
  firestore.collection('testUsers').doc(winner).update({
    "drinksGiven.beers": fieldValue.increment(beers),
    "drinksGiven.shots": fieldValue.increment(shots),
    betsWon: fieldValue.increment(1)
  });
};

function incrementLosers(loser, beers, shots) {
  firestore.collection('testUsers').doc(loser).update({
    betsLost: fieldValue.increment(1),
    "drinksReceived.beers": fieldValue.increment(beers),
    "drinksReceived.shots": fieldValue.increment(shots),
    "drinksOutstanding.beers": fieldValue.increment(beers),
    "drinksOutstanding.shots": fieldValue.increment(shots)
  });
};

function moveToOutStanding(loser) {
  betRef.set({
    outstandingUsers: fieldValue.arrayUnion(loser)
  }, {
    merge: true
  })
};

function finished() {
  betRef.set({
    isFinished: true,
    dateFinished: Date.now() / 1000
  }, {
    merge: true
  })
};

function removeInvitedUsers() {
  betRef.set({
    invitedUsers: {}
  }, {
    merge: true
  })
}

function side1Winners() {
  betRef.set({
    winner: 'one'
  }, {
    merge: true
  })
}

function side2Winners() {
  betRef.set({
    winner: 'two'
  }, {
    merge: true
  })
}

function moveOutOfOutstanding() {
  betRef.set({
    outstandingUsers: fieldValue.arrayRemove(currentUser),
  }, {
    merge: true
  });

  setTimeout(() => {
    location.reload();
  }, 700);

}

function decrementOutstanding(doc) {
  const beers = doc.data().stake.beers;
  const shots = doc.data().stake.shots;
  const userRef = firestore.collection('testUsers').doc(currentUser);
  userRef.update({
    "drinksOutstanding.beers": fieldValue.increment(beers * -1),
    "drinksOutstanding.shots": fieldValue.increment(shots * -1)
  }, {
    merge: true
  });
};

function incrementBetTotal() {
  uninvitedUser.update({numBets: fieldValue.increment(1)})
};

function moveToAcceptedUsers(betRef){
  betRef.update({
    acceptedUsers: fieldValue.arrayUnion(currentUser)
  })
};

function addToAllUsers(betRef){
  betRef.update({
    allUsers: fieldValue.arrayUnion(currentUser)
  })
};
