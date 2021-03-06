function SignalingChannel(id){

    var _ws;
    var self = this;

    function connectToTracker(url){
        _ws = new WebSocket(url);
        _ws.onopen = _onConnectionEstablished;
        _ws.onclose = _onClose;
        _ws.onmessage = _onMessage;
        _ws.onerror = _onError;
    }

    function _onConnectionEstablished(){
        _sendMessage('init', id);
    }

    function _onClose(){
        console.error("connection closed");
    }

    function _onError(err){
        console.error("error:", err);
    }


    function _onMessage(evt){
        var objMessage = JSON.parse(evt.data);
        switch (objMessage.type) {
            case "ICECandidate":
                self.onICECandidate(objMessage.ICECandidate, objMessage.source);
                break;
            case "offer":
                self.onOffer(objMessage.offer, objMessage.source);
                break;
            case "answer":
                self.onAnswer(objMessage.answer, objMessage.source);
                break;
            case "listOfPeers":
                self.onListOfPeers(objMessage.listOfPeers, objMessage.source);
                break;
            case "addPeer":
                self.onAddPeer(objMessage.addPeer, objMessage.source);
                break;
            case "removePeer":
                self.onRemovePeer(objMessage.removePeer, objMessage.source);
                break;


            default:
                throw new Error("invalid message type");
        }
    }

    function _sendMessage(type, data, destination){
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws.send(JSON.stringify(message));
    }

    function sendICECandidate(ICECandidate, destination){
        _sendMessage("ICECandidate", ICECandidate, destination);
    }

    function sendOffer(offer, destination){
        _sendMessage("offer", offer, destination);
    }

    function sendAnswer(answer, destination){
        _sendMessage("answer", answer, destination);
        
    }

    this.connectToTracker = connectToTracker;
    this.sendICECandidate = sendICECandidate;
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;

    //default handler, should be overriden 
    this.onOffer = function(offer, source){
        console.log("offer from peer:", source, ':', offer);
        var peerConnection = createPeerConnection(self,source);
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peerConnection.createAnswer(function(answer){
            peerConnection.setLocalDescription(answer);
            console.log('send answer');
            self.sendAnswer(answer, source);
        }, function (e){
            console.error(e);
        });
    };

    //default handler, should be overriden 
    this.onAnswer = function(answer, source){
        console.log("answer from peer:", source, ':', answer);
    };

    this.onListOfPeers = function (listOfPeers, source){
        console.log(listOfPeers);
        listOfConnectedPeers(listOfPeers);
    }
    this.onAddPeer = function(peerid, source){
       console.log("this.onAddPeer: "+peerid);
       //listOfConnectedPeers(listOfPeers); 
       startPeerConnection(peerid);
    }

    this.onRemovePeer = function(peerid, source){
       console.log("onRemovePeer: "+peerid);
       //listOfConnectedPeers(listOfPeers); 
       //startPeerConnection(peerid);
    }

    //default handler, should be overriden 
    this.onICECandidate = function(ICECandidate, source){
        console.log("ICECandidate from peer:", source, ':', ICECandidate);
    };
}

window.listOfConnectedPeers = function(list){
    console.log(list);
}

window.createSignalingChannel = function(url, id){
    var signalingChannel = new SignalingChannel(id);
    signalingChannel.connectToTracker(url);
    return signalingChannel;
};
