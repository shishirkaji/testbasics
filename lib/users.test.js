const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');

var mongoose = require('mongoose');
var mailer = require('./mailer')
var users = rewire('./users');
const user = require('./models/user');

var sandbox = sinon.createSandbox();

describe('users', () => {

    let findStub;
    let sampleArgs;
    let sampleUser;
    let mailerStub;
    let deleteStub;
    beforeEach(() => {
        // console.log("before each being called")
        sampleUser = {
            id: 123,
            name: "foo",
            email: "foo@bar.com"    
        }
        //  this below line is basically creating a findById function that resolves the 
        // sampleUser
        findStub = sandbox.stub(mongoose.Model, "findById").resolves(sampleUser)
        deleteStub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
        mailerStub = sandbox.stub(mailer, "sendWelcomeEmail").resolves('fake_sendWelcomeEmail')
    })

    afterEach(() => {
        // console.log('after each being called')
        sandbox.restore();
        users = rewire('./users')
    })

    context('get', () => {
        it('should check for id', (done) => {
            users.get(null, (err, result) => {
                expect(err).to.exist;
                expect(err.message).to.equal('Invalid user id');
                done()
            })
        })
        it('Should call the User.findById function to find a user', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, { name: "foo" });
            users.get(123, (err, result) => {
                expect(err).to.not.exist;
                expect(stub).to.have.been.calledWith(123);
                expect(stub).to.have.been.calledOnce;
                expect(result).to.be.a('object');
                expect(result).to.have.property('name').to.equal('foo');
                done();
            })
        })
        it('should catch error if there is one', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('fake'));
            users.get(123, (err, result) => {
                expect(result).to.not.exist;
                expect(err).to.exist;
                expect(err).to.be.an.instanceOf(Error);
                expect(stub).to.have.been.calledOnceWith(123)
                done()
            })
        })
    })

    context('delete', () => {
        it('should check for an id using return', async () => {
            try {
                let result = await users.delete()
                if (result) throw new Error('It should have returned error because no id passed.')
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.equal('Invalid id')
            }
        })
        it('should remove user', async () => {
            let result = await users.delete(123);
            // console.log("result---- " + result)
            expect(result).to.be.equals('fake_remove_result');
            expect(deleteStub).to.be.calledOnce;
            expect(deleteStub).to.have.been.calledWith({ _id: 123 });

        })

    })

    context("Create User", () => {
        let FakeUserClass, saveStub, result;
        beforeEach(async () => {
            saveStub = sandbox.stub().resolves(sampleUser);
            FakeUserClass = sandbox.stub().returns({ save: saveStub })

            users.__set__('User', FakeUserClass);
            result = await users.create(sampleUser)
        })
        it('should throw error if no arg passed', async () => {
            try {
                let result = await users.create();
                if (result) throw new Error('It should have thrown error when trying to create user with no args')
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.be.equal('Invalid arguments')
            }
        })

        it('should call User with new', () => {
            expect(FakeUserClass).to.have.been.calledWithNew;
            expect(FakeUserClass).to.have.been.calledWith(sampleUser);
        })
        it('should save the user', () => {
            expect(saveStub).to.have.been.called;
        })
        it('should call the mailer with email and name', () => {
            expect(mailerStub).to.have.been.calledWith(sampleUser.email, sampleUser.name)
        })
    })
})