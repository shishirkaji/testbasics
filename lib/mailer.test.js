const expect = require('chai').expect;
const rewire = require('rewire');
const mailer = rewire('./mailer')
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

describe('Mailer', () => {
    context(' sendWelcomeEmail ', () => {
        it("should fail if email is not passed", async () => {
            try {
                const result = await mailer.sendWelcomeEmail(undefined, 'shishir');
                expect(result).to.not.exist;
            } catch (error) {
                expect(error.message).to.exist;
                expect(error.message).to.be.equal('Invalid input')
            }
        })
        it("should fail if name is not passed", async () => {
            try {
                const result = await mailer.sendWelcomeEmail("foo@gmail.com");
                expect(result).to.not.exist;
            } catch (error) {
                expect(error.message).to.exist;
                expect(error.message).to.be.equal('Invalid input')
            }
        })
        it('should send email', async () => {
            const result = await mailer.sendWelcomeEmail('foo@gmail.com', 'shishir');
            expect(result).to.be.equal('Email sent');
        })
    })
    context('Send password reset email', () => {
        it('should fail if email is not passed', (done) => {
            mailer.sendPasswordResetEmail().then(result => {
                if (result) throw new Error('Should not send reset pass email with out passing email to the function.')
            }).catch((err) => {
                expect(err).to.exist;
                expect(err.message).to.be.equal('Invalid input')
                done();
            })
        })
        it('should send reset email', (done) => {
            mailer.sendPasswordResetEmail('shishirkaji@gmail.com').then(result => {
                expect(result).to.exist;
                expect(result).to.be.equal('Email sent');
                done()
            }).catch(err => {
                // expect(err).to.not.exist;
            })
        })
    })
})