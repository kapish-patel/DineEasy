console.log('starting test');
var chai = require('chai');
var chaiHttp = require('chai-http');
const fs = require('../App.js');

var expect = chai.expect;

var http = require('http');
chai.use(chaiHttp);

if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// Test to get one restaurant
describe('Test GET one Restaurant result from cloud', function () {
    
    var requestResult;
    var response;
            
    before(function (done) {
        chai.request("https://dineeasyy.azurewebsites.net")
            .get("/restaurants/1")
            .end(function (err, res) {
                requestResult = res.body;
                response = res;
                console.log("response--", response)
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
        });
    
    // Test to check all the properties in the response object
    it('Should return a single object of restaurant from cloud', function (){
        expect(response).to.have.status(200);
        expect(response.body).to.include.keys('name');
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('resId').to.be.equal('1').to.be.a.string;
        expect(response.body).to.have.property('image');
        expect(response.body).to.have.property('location');
        expect(response.body).to.have.property('rating').not.to.be.a.string;
        expect(response.body).to.have.property('reviews').not.to.be.a.string;
        expect(response.body).to.have.property('cost');
        expect(response.body).to.have.property('cuisines');
        expect(response.body).to.have.property('contact');
        expect(response.body).to.have.property('neighborhood');
        expect(response.body).to.have.property('hours');
        expect(response.body).to.have.property('parkingdetails');
        expect(response.body).to.have.property('isValetPark').not.to.be.a.string;
        expect(response).to.have.headers;
    });

});
