import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDoc, doc, setDoc, query, getDocs} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCeDaUAnVK0iANNiSTZ7k0z_K9VuX6LTR4",
    authDomain: "slotmachine-83c3a.firebaseapp.com",
    projectId: "slotmachine-83c3a",
    storageBucket: "slotmachine-83c3a.appspot.com",
    messagingSenderId: "392279944402",
    appId: "1:392279944402:web:59a67ce3930b8eda2d510b",
    measurementId: "G-BLKXCWRPD5"
};

//initializations
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//db stuff
const addDbBtn = document.getElementById("add-to-db");
var userM;
const playerBalance = document.getElementById("player-balance");

async function onLogin(currUser) {
    const docRef = doc(db, `${currUser.email}`, `${currUser.uid}`);
    const docSnap = await getDoc(docRef);
    userM = docSnap.data().userMoney;
    console.log("userM = " + userM);
    playerBalance.innerHTML = `${docSnap.data().user}'s balance: ${docSnap.data().userMoney}`;
}

async function onSignup(currUser) {
    const docRef = await setDoc(doc(db, `${currUser.email}`, `${currUser.uid}`), {
        user: `${currUser.email}`,
        userMoney: 500
    });
}

async function onRoll(currUser) {
    userM -= 10;
    console.log(userM);
    const docRef = doc(db, `${currUser.email}`, `${currUser.uid}`);
    await setDoc(docRef, {
        user: `${currUser.email}`,
        userMoney: userM
    })
    const docSnap = await getDoc(docRef);
    //console.log("new user money: " + docSnap.data().userMoney);
    playerBalance.innerHTML = `${docSnap.data().user}'s balance: ${docSnap.data().userMoney}`;
}

async function onWin(currUser) {
    userM += 100;
    console.log(userM);
    const docRef = doc(db, `${currUser.email}`, `${currUser.uid}`);
    await setDoc(docRef, {
        user: `${currUser.email}`,
        userMoney: userM
    })
    const docSnap = await getDoc(docRef);
    //console.log("new user money: " + docSnap.data().userMoney);
    playerBalance.innerHTML = `${docSnap.data().user}'s balance: ${docSnap.data().userMoney}`;
}

// addDbBtn.addEventListener("click", async () => {
//     try {
//         const docRef = await setDoc(doc(db, `${user.email}`, `${user.uid}`), {
//             user: `${user.email}`,
//             userMoney: 500
//         });

//         //console.log("Document writtein with ID: ", docRef.id);
//     } catch (e) {
//         console.error("Error adding document: ", e);
//     }
// })



//login/sign up form stuff
var user;
const logInBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

var tempLoginEmail = "";
var tempLoginPass = "";
var tempSignupEmail = "";
var tempSignupPass = "";

var loginAttemp = false;
var singupAttemp = false;

//login button stuff
logInBtn.addEventListener("click", () => {
    if (loginAttemp == false) {
        loginAttemp = true;
        const loginDiv = document.createElement("div");
        loginDiv.id = "login-form";
    
        const emailInput = document.createElement("input");
        emailInput.id = "login-email";
        emailInput.className = "login-input-item";
        emailInput.placeholder = "Email";
    
        const passwordInput = document.createElement("input");
        passwordInput.id = "login-pass";
        passwordInput.className = "login-input-item";
        passwordInput.placeholder = "Password";
    
        const submitLoginBtn = document.createElement("button");
        submitLoginBtn.innerHTML = "Login";
        submitLoginBtn.addEventListener("click", () => {
            tempLoginEmail = emailInput.value;
            tempLoginPass = passwordInput.value;
            if (tempLoginEmail !== "" && tempLoginPass !== "") {
                loginAttemp = false;
                signInWithEmailAndPassword(auth, tempLoginEmail, tempLoginPass)
                    .then((userCredential) => {
                        user = userCredential.user;
                        console.log(user);
                        onLogin(user);
                        document.getElementById("loged-in-as").innerHTML = "Logged in as " + user.email;
                    })
                    .catch ((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(errorCode + " : " + errorMessage);
                    })
                loginDiv.remove();
            }
        })
    
        loginDiv.appendChild(emailInput);
        loginDiv.appendChild(passwordInput);
        loginDiv.appendChild(submitLoginBtn);

        document.body.appendChild(loginDiv);
    }

})

//sign up button stuff
signupBtn.addEventListener("click", () => {
    if (singupAttemp == false) {
        singupAttemp = true;
        const signupDiv = document.createElement("div");
        signupDiv.id = "signup-form";
    
        const emailInput = document.createElement("input");
        emailInput.id = "signup-email";
        emailInput.className = "signup-input-item";
        emailInput.placeholder = "Email";
    
        const passwordInput = document.createElement("input");
        passwordInput.id = "signup-pass";
        passwordInput.className = "signup-input-item";
        passwordInput.placeholder = "Password";
    
        const submitLoginBtn = document.createElement("button");
        submitLoginBtn.innerHTML = "signup";
        submitLoginBtn.addEventListener("click", () => {
            tempSignupEmail = emailInput.value;
            tempSignupPass = passwordInput.value;
            if (tempSignupEmail !== "" && tempSignupPass !== "") {
                singupAttemp = false;
                createUserWithEmailAndPassword(auth, tempSignupEmail, tempSignupPass)
                    .then((userCredential) => {
                        //signed up
                        user = userCredential.user;
                        console.log(user);
                        onSignup(user);
                    
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.Message;
                        console.log(errorCode + " : " + errorMessage);
                    })
                signupDiv.remove();
            }
        })
    
        signupDiv.appendChild(emailInput);
        signupDiv.appendChild(passwordInput);
        signupDiv.appendChild(submitLoginBtn);

        document.body.appendChild(signupDiv);
    }

})


// slot machine logic
const iconWidth = 79;
const iconHeight = 79;
const numOfIcons = 9;
const timePerIcon = 100;

const indexes = [0, 0, 0];
const iconMap = ['banana', 'seven', 'cherry', 'plum', 'orange', 'bell', 'bar', 'lemon', 'melon'];

var rolling = false;
const rollBtn = document.getElementById("roll-btn");
rollBtn.addEventListener("click", () => {
    if (!rolling) {
        onRoll(user);
        rollAll();
    }
});

const roll = (reel, offset = 0) => {
    const delta = (offset + 2) * numOfIcons + Math.floor(Math.random() * numOfIcons);
    const style = getComputedStyle(reel);
    var bgPositionY = parseFloat(style["background-position-y"]);
    var targetPositionY = bgPositionY + delta * iconHeight;
    var normTargetBgPositionY = targetPositionY % (numOfIcons * iconHeight);

    return new Promise((resolve, reject) => {

        reel.style.transition = `background-position-y ${8 + delta * timePerIcon}ms cubic-bezier(.5,-0.11,.54,1.46)`;
        reel.style.backgroundPositionY = `${targetPositionY}px`;

        setTimeout(() => {
            reel.style.transition = 'none';
            reel.style.backgroundPositionY = `${normTargetBgPositionY}px`;
            resolve(delta % numOfIcons)
        }, 8 + delta * timePerIcon);
    })
};

function rollAll() {
    rolling = true;
    const reelsList = document.querySelectorAll('.slots > .reel');
    Promise
    .all( [...reelsList].map((reel, i) => roll(reel, i)))
        .then((delta) => {
            delta.forEach((delta, i) => {
                indexes[i] = (indexes[i] += delta) % numOfIcons;
            })
            indexes.map((index) => {
                console.log(iconMap[index]);
            });

            // check win condition
            if ((indexes[0] === indexes[1]) || (indexes[0] === indexes[1] === indexes[2])) {
                console.log("WINWINWINWI!");
                onWin(user);
            }

            setTimeout(() => {rolling = false;}, 1000);
        });
    // [...reelsList].map((reel, i) => {
    //     roll(reel, i).then((delta) => { console.log(delta)});
    // });
}