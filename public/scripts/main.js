var rhit = rhit || {};

rhit.fbAuthManager = null;

function htmlToElement(html) {
	console.log("htmltoelement in here?");
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
		document.querySelector("#signOutButton").addEventListener("click", (event) => {
			console.log("signing out");
			rhit.fbAuthManager.signOut();
		});
	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			console.log("attempting login");
			rhit.fbAuthManager.signIn();
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		console.log("authmanager created");
		this._user = null;
	}

	beginListening(changeListener){
		firebase.auth().onAuthStateChanged((user) => {
			console.log("listening");
			this._user = user;
			changeListener();
		  });
	}

	signIn() {
		Rosefire.signIn("aac5cbc1-aeab-43f1-963a-5b76c486d811", (err, rfUser) => {	//maybe shouldnt be public but uhhhh :^)
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);

			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token'){
					alert('The token you provided is not valid.');
				}else{
					console.error("custom auth error", errorCode, errorMessage);
				}
			});
		  });
	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("sign out error");
		});
	}

	get isSignedIn() {
		console.log("isSignedIn() called");
		return !!this._user;	//NOT NOT casts it to a truthy value, then flips it back to what it truly is
	}

	// get uid() {
	// 	return this._user.uid;
	// }
}

rhit.checkForRedirects = function() {
	console.log("redirects");
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		window.location.href = "/list.html";
		console.log("1isi within redirect");
	}if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn){
		window.location.href = "/";
		console.log("2isi within redirect");
	}
};

rhit.initializePage = function() {
	const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#listPage")) {
		console.log("list page");
		new rhit.ListPageController();
	}else{
		new rhit.LoginPageController();
	}
};


rhit.main = function () {
	console.log("r");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		//redirect check
		rhit.checkForRedirects();
		//page initialization
		rhit.initializePage();
	});
};

rhit.main();