const express = require('express');

const router = express.Router();

const USER = require('../model/userSchema');
const CANDIDATE = require('../model/candidateSchema');
const VOTE = require('../model/voteSchema');

const { jwtAuthMiddleware, jwtParser } = require('../middleware/jwt');

const { DateTime } = require('luxon');

const convertToIST = (utcDate) => {
  return DateTime.fromJSDate(utcDate, { zone: 'utc' })  // Ensure it's a DateTime in UTC
    .setZone('Asia/Kolkata')  // Convert to IST
    .toFormat('dd LLL yyyy, HH:mm'); // Desired format: Day Month Year, Hour:Minute
};



const isAdmin = (role) => role === 'admin';

router.get('/', jwtParser, async (req, res) => {
  try {
    const user = await USER.findById(req.user.id);

    if (user.role === 'admin') return res.redirect('/admin');

    res.render('home', {
      logout: 'yes',
    });

  }
  catch (err) {
    console.log(err);
    res.render('home');
  }

})

router.get('/signup', (req, res) => {
  res.render('signup');
})

router.get('/login', (req, res) => {
  res.render('login');
})

router.get('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.redirect('/');
})

router.get('/admin/candidate', jwtAuthMiddleware, (req, res) => {
  if (!isAdmin(req.user.role)) return res.redirect('/?you are not authorised');
  res.render('addCandidate');
})

router.get('/admin', jwtAuthMiddleware, async (req, res) => {
  if (!isAdmin(req.user.role)) return res.redirect('/?you are not authorised');
  const candidate = await CANDIDATE.find();
  res.render('admin', {
    candidates: candidate,
  });
})

router.get('/admin/candidate/delete', jwtAuthMiddleware, (req, res) => {

  if (!isAdmin(req.user.role)) return res.redirect('/?you are not authorised');

  res.render('removeCandidate');

})

router.get('/admin/voting', jwtAuthMiddleware, async (req, res) => {
  if (!isAdmin(req.user.role)) return res.redirect('/?you are not authorised');

  try {
    const users = await USER.find();
    let totalVotes = await VOTE.find();


    const candidates = await CANDIDATE.find();

    // An array to store the vote counts for each party
    const votes = [];

    // Use Promise.all to wait for all asynchronous operations to complete
    await Promise.all(
      candidates.map(async (candidate) => {
        // Count the number of votes for the candidate's party
        const vote = await VOTE.find({ partyName: candidate.partyName });

        // Push the result to the votes array
        votes.push({
          partyName: candidate.name + ',' + candidate.partyName,
          votes: vote.length, // Use `length` to get the count of found votes
        });
      })
    );

    // Sort the votes by the number of votes in descending order
    votes.sort((a, b) => b.votes - a.votes);

    // Sort the totalVotes array by voting time and update the date
    totalVotes = totalVotes
      .sort((a, b) => b.VotedAt - a.VotedAt)
      .map((vote) => ({
        ...vote.toObject(),
        VotedAt: convertToIST(vote.VotedAt), // Convert to IST
      }));


    // Render the template with the sorted results
    res.render('votingPanel', {
      totalVotes,
      votes,
      totalCandidates: candidates.length, // Use `length` for arrays
      totalUsers: users.length,
    });

  } catch (err) {
    console.error('Error in /admin/voting:', err);
    res.status(500).send('An error occurred while retrieving voting data.');
  }
});

router.get('/user/vote', jwtAuthMiddleware, async (req, res) => {

  if (req.user.role === 'admin') return redirect('/admin?admin cannot vote');

  const candidates = await CANDIDATE.find();

  res.render('vote', {
    candidates: candidates,
    logout: 'yes'
  });

})

router.get('/user/vote/certificate', jwtAuthMiddleware, async (req, res) => {

  if (req.user.role === 'admin') return redirect('/admin?admin cannot vote');
  try {
    const user = await USER.findById(req.user.id);

    const vote = await VOTE.find({ user: req.user.id });

    const date = vote[0].VotedAt;

    const newDate = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`

    if (!vote) res.redirect('/user/vote');

    res.render('thankyou', {
      name: user.name,
      date: newDate
    });
  }
  catch (err) {
    console.log(err);
    res.redirect('/?error=internal server error');
  }

})

module.exports = router;