## Searchly Sample Node.js Application.

This example illustrates basic search features of Searchly.

Sample application is using [elasticsearchclient](https://github.com/phillro/node-elasticsearch-client) Node.js [ElasticSearch](http://www.elasticsearch.org) client to integrate with Searchly.

To create initial index and sample data click Create Sample Index&Data! (2 sample documents will be created.) at index page.

Type "*" or "cloud" to search box and hit enter for sample search results.


## Local Setup

To run example in your local environment with a local ElasticSearch instance, change connection string with local url string inside web.js

var connectionString = url.parse('http://localhost:9200')

## Heroku Deployment

This sample can be deployed to Heroku with no change.

* Install SearchBox/Searchly Addon
* Deploy sample application

## CloudFoundry Deployment

* Install Searchly Addon
* Deploy sample application
