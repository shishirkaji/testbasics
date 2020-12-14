const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const rewire = require('rewire');
const { createStubInstance, stub } = require('sinon');
var demo = rewire('./demo');
const sinon = require('sinon')
const sinonChai = require('sinon-chai');
chai.use(sinonChai)
describe('demo', () => {
    context('add', () => {
        it('should  add two numbers', (done) => {
            expect(demo.add(1, 2), "Add function failed.").to.equal(3)
            done()
        })
    })
    context('Callback add', () => {
        it('should test the callback', (done) => {
            demo.addCallback(1, 2, (err, result) => {
                expect(err).to.not.exist;
                expect(result).to.equal(3);

                done()
            })
        })
    })
    context("promise illustration add function", () => {
        it('should test the promise', async () => {
            let result = await demo.addPromise(2, 3)
            console.log(result)
            expect(result, "Promise issue in the add functions").to.equals(5)
            console.log("test passed")
        }
        )
    }
    )

    context('test doubles', () => {
        it('should spy on the log', () => {
            let spy = sinon.spy(console, 'log');
            demo.foo();
            expect(spy.calledOnce).to.be.true;
            expect(spy).to.have.been.calledOnce;
            spy.restore();
        })

        it('should stub console.warn', () => {
            let stub = sinon.stub(console, 'warn').callsFake(()=>{console.log('this is a fake return ')});
            demo.foo();
            expect(stub).to.have.been.calledOnce;
            // expect(stub).to.have.been.calledWith('console.warn was')
            stub.restore();
        })
    })

    context('stub private functions ',()=>{
        it('should stub createfile',async ()=>{
            let createStub = sinon.stub(demo,'createFile').resolves('create_stub');
            let callStub = sinon.stub().resolves('calldb_stub');
            demo.__set__('callDB',callStub);
            let result = await demo.bar('test.txt');

            expect(result).to.equal('calldb_stub');
            expect(createStub).to.have.been.calledOnce;
            expect(callStub).to.have.been.calledOnce;
            expect(createStub,"Should have tested using file test.txt").to.have.been.calledOnceWith('test.txt');
            sinon.restore();
        })
    })


})

