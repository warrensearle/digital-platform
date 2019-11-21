/*eslint-disable no-unused-vars*/
const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const emailIsValid = require('../sharedServices').emailIsValid;
const db = require('../sharedServices').db;

exports.handleExerciseMailboxChange = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {

    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.data();

    const email = data.exerciseMailbox;
    const previousEmail = previousData.exerciseMailbox;

    if (emailIsValid(email) == false) {
      // Make sure to set the email back to the previous email
      // when email address is invalid
      const exerciseRef = db.collection('exercises').doc(context.params.exerciseId);

      // You need the "merge: true" part, or else it might overwrite an already existing document.
      // More info here:
      // https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document
      const setWithMerge = exerciseRef.set({
        exerciseMailbox: previousEmail 
      }, { merge: true});

      console.error(`${email} is an invalid email format. Leaving email mailbox as ${previousEmail}`)
      return null;      
    }

    // We'll only update if the exerciseMailbox has changed.
    // This is crucial to prevent infinite loops.
    if (email == previousEmail) return null;

    // set this data to personalize the Exercise mailbox changed email template
    const personalizationData = {
      exerciseName: data.name,
      previousEmail: previousEmail,
      newEmail: email,
    }

    // Check that the firebase config has the key by running:
    // firebase functions:config:get
    //
    // Set notify.templates.exercise_mailbox_changed in firebase functions like this:
    // firebase functions:config:set notify.templates.exercise_mailbox_changed="THE_GOVUK_NOTIFY_TEMPLATE_ID"
    const templateId = functions.config().notify.templates.exercise_mailbox_changed;

    return sendEmail(email, templateId, personalizationData).then((sendEmailResponse) => {
      console.info(`Exercise "${data.name}" - mailbox ${previousEmail} has been changed to ${email}`);
      return true;
    });
  });

