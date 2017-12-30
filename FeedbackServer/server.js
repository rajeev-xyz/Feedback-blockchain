var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    package = require('./package.json');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

//Mongo DB Setup
mongoose.Promise = global.Promise;
mongoose.connect(package.config.DBUri, {useMongoClient: true} , function(error) {
    // Check error in initial connection. There is no 2nd param to the callback.
    if (!error){
        console.log('Connected to database %s', package.config.DBUri);
    }else {
        console.log('Could not connect to database %s', package.config.DBUri); 
    }
});

var userSchema = new mongoose.Schema({
    MobileNo:  String,
    Name: {type: String, default: 'Anonymous'},
    Role: {type: String, default:'reporter', enum: ['reporter', 'admin', 'superadmin']},
    Org: String
},{ 
    timestamps: true 
});


var fbSchema = new mongoose.Schema({
    User: { type: mongoose.Schema.ObjectId, ref: User },
    IsAnonymous: Boolean,
    Description: String,
    Title: String,
    Sentiment: {type: String, default:'negative', enum: ['Negative', 'Positive', 'Neutral']},
    Status: {type: String, default: 'new', enum: ['new', 'wip', 'closed']},
    Org: String,
    IsActive: Boolean,
    Priority: {type: String, default: 'p1', enum: ['p1','p2','p3']},
    AssignedTo: { type: mongoose.Schema.ObjectId, ref: User },
    Location: String,
    Attachement: { data: Buffer, contentType: String },
},{ 
    timestamps: true 
});

var User = mongoose.model('sys_user', userSchema);
var Feedback = mongoose.model('sys_feedback', fbSchema);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/createUser', function(req, res){
    console.log(req.body);
    
    var user = new User({
        MobileNo: req.body.MobileNo,
        Name: req.body.Name,
        Role: req.body.Role,
        Org: req.body.Org
    });

    user.save(function(error){
        if (!error){
            console.log('user %s saved', user.Name);
            res.sendStatus(200);
        }else {
            res.sendStatus(500);
        }
    });
});

app.post('/createFeedback', function(req, res){
    var data = req.body;
    var fb = new Feedback({
        User: data.Reporter,
        IsAnonymous: data.IsAnonymous,
        Description: data.Description,
        Title: data.Title,
        Sentiment: data.Sentiment,
        Status: 'new',
        Org: data.Org,
        IsActive: true,
        Priority: data.Priority,
        AssignedToId: '',
        Location: data.Location || 'Hyderabad',
        Attachement: data.Attachement || ''
    });
    console.log(fb);
    fb.save(function(error){
        if (!error){
            res.status(200).send('Feedback ' + fb._id + ' Saved');
        }else {
            console.log(error);
            res.status(500).send(error);
        }
    });


});

app.get('/reportedByMe', function(req, res){
    var loggedUser = req.body.loggedUser;
    if (!loggedUser){
        return res.status(500).send('User not logged in');
    }
    Feedback.find({User: loggedUser, Org: req.body.Org}, function(err, data){
        if (!err)
            res.status(200).send(data);
        else{
            res.status(500).send('Couldn\'t fetch feedback list');
        }
    });
});

app.get('/assignedToMe', function(req, res){
    var loggedUser = req.body.loggedUser;
    if (!loggedUser){
        return res.status(500).send('User not logged in');
    }
    Feedback.find({AssignedToId: loggedUser, Org: req.body.Org}, function(err, data){
        if (!err)
            res.status(200).send(data);
        else{
            res.status(500).send('Couldn\'t fetch feedback list');
        }
    });
});

app.get('/allFbForOrg', function(req, res){
    Feedback.find({Org: req.body.Org}, function(err, data){
        if (!err)
            res.status(200).send(data);
        else{
            res.status(500).send('Couldn\'t fetch feedback list');
        }
    });
});

app.get('/allFbForAllOrg', function(req, res){
    Feedback.find({}, function(err, data){
        if (!err){
            console.log(data);
            res.send(data);
        }
        else{
            console.log(err);
            res.status(500).send('Couldn\'t fetch feedback list');
        }
    });
});

var PORT = process.env.PORT || package.config.PORT;
app.listen(PORT, function () {
  console.log('Server listening on port %d', PORT);
});