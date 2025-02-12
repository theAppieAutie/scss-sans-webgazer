exports.startTrial = async (req, res, next) => {
    try {
        if (!req.session.condition) {
            return res.redirect('/');
        }
        
        // Retrieve experiment info
        
        const condition = req.session.condition;
        const group = req.session.groupName;
        const censorship = req.session.censoredInfo;
        let conditionText = '';
        const censoredArrayNumber = req.session.censoredArrayNumber;
        req.session.trialStartTime = new Date().toISOString();
        
        const packetArray = req.session.packetArray.map(x => x);
    
        // set condition text to be more user friendly
        switch (condition) {
        case "noAdvisor":
            conditionText = ""; 
            break;
        case "aiAdvisor":
            conditionText = "This is the recommendation of a 66% accurate A.I Expert";
            break;
        case "humanAdvisor":
            conditionText = "This is the recommendation of a 66% accurate human expert";
            break;
        default:
            conditionText = ''; // Default to no text
        }
        res.render('trial.ejs', { conditionText, group, censorship, censoredArrayNumber, packetArray: JSON.stringify(packetArray)})
    } catch (err) {
        console.error(err);
    }
}

exports.stopTrial = async (req, res, next) => {
    try {
        const trialEndTime = req.body["trialEndTime"];
        const trialType = req.session.trialNumber === 0 ? 'test' : 'main';
        const trialId = await req.dbServices.insertTrial(req.session.participantId, trialType, req.session.trialNumber, req.session.trialStartTime, trialEndTime);
        req.session.trialNumber++;

        for (let input of req.body["input"]) {
            input['time'] = input['time'] ? input['time'] : new Date().toISOString();
            await req.dbServices.insertPacket(trialId, input.user, input.advisor, input.accepted, input.time);
        }
        
        res.status(200).json({ message: 'Regular data received successfully' });

    } catch (err) {
        console.error("Error caught :",err);
    }
}



