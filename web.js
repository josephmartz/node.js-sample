/**
 * Module dependencies.
 */

var express = require('express'),
    ElasticSearchClient = require('elasticsearchclient'),
    url = require('url'),
    express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    path = require('path');

// Searchly ElasticSearch configuration with elasticsearchclient

var connectionString;

if (process.env.SEARCHBOX_URL) {
    // Heroku
    connectionString = url.parse(process.env.SEARCHBOX_URL);
} else if (process.env.VCAP_SERVICES) {
    // CloudFoundry
    connectionString = url.parse(JSON.parse(process.env.VCAP_SERVICES)['searchly-n/a'][0]['credentials']['uri']);
} else {
    // Generic
    connectionString = url.parse('http://site:yourkey@api.searchbox.io');
    //var connectionString = url.parse('http://localhost:9200');
}

console.info(connectionString);

var serverOptions = {
    host:connectionString.hostname,
    path:connectionString.pathname,
    auth: {
        username: connectionString.auth.split(':')[0],
        password: connectionString.auth.split(':')[1]
  }
};

var elasticSearchClient = new ElasticSearchClient(serverOptions);

var _index = "sample";
var _type = 'document';


// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes
app.get('/', function (req, res) {
    res.render('index', {"result":""})
});

app.get('/index', function (req, res) {

    // Create index first
    elasticSearchClient.createIndex(_index, {}, {}).on('data',
        function (data) {

            //Bulk index example
            var commands = []
            commands.push({ "index":{ "_index":_index, "_type":_type, "_id":"1"} });
            commands.push({'name':'Reliability', 'text':'Reliability is improved if multiple ' +
                'redundant sites are used, which makes well-designed cloud computing suitable for business continuity and disaster recovery. '});

            commands.push({ "index":{ "_index":_index, "_type":_type, "_id":"2"} });
            commands.push({'name':'Virtualization', 'text':'Virtualization technology allows servers and storage devices to be shared and utilization be increased. ' +
                'Applications can be easily migrated from one physical server to another. '});

            elasticSearchClient.bulk(commands, {})
                .on('data', function (data) {
                    res.render('index', {result:'Indexing Completed!'});
                })
                .on('error', function (error) {
                    res.render('index', {result:error});
                })
                .exec();

        }).on('error', function (error) {
            res.render('index', {result:error});
        }).exec();


    /*  Index example

     elasticSearchClient.index(_index, _type, {'name':'Reliability', 'text':'Reliability is improved if multiple ' +
     'redundant sites are used, which makes well-designed cloud computing suitable for business continuity and disaster recovery. ', id:"1"})
     .on('data', function (data) {
     //res.render('index', { result:data })
     res.render('index')
     })
     .exec();

     */

})

app.get('/search', function (req, res) {

    var qryObj = {
        "query": {
            "multi_match" : {
                "query" : req.query.q,
                "fields" : [ "name", "text" ]
            }
        }
    }

    elasticSearchClient.search(_index, _type, qryObj)
        .on('data',
        function (data) {
            res.render('search', { result:JSON.parse(data)})
        }).on('error', function (error) {
            res.render('search', { result:error })
        })
        .exec();
});

app.get('/about', function (req, res) {
    res.render('about');
});

var port = process.env.PORT || 4000;

server.listen(port);
