function SPG_GenPassword(lengthOfPassword=8, UseSymbols=true,HeadPassword="",theLetters="adehijnr",theNumber="34567",theSymbols="#@%+=.*") {
	theLetters 		+=	theLetters.toUpperCase()+
						theNumber+
						(UseSymbols ? theSymbols : "");
	for (var i = 0; i < lengthOfPassword; i++)HeadPassword += theLetters.charAt(Math.floor(Math.random() * theLetters.length));
	return HeadPassword; 
}

