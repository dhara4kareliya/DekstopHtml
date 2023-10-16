

const soundCheckbox = $("#soundCheckbox")[0];
soundCheckbox.addEventListener('change', () => {
    setSoundEnable(soundCheckbox.checked);
});

let soundEnable = true;
soundCheckbox.checked = true;

function setSoundEnable(value) {
  soundEnable = value;
}
export class Sound
{
  constructor() {
    this.m_audioCardDealt = new Audio("../audio/Dealing-cards.wav");

    this.m_audioEndStreet = new Audio("../audio/EndOfStreets.wav");

    this.m_audioFlop = new Audio("../audio/Flop.wav");

    this.m_audioTurnRiver = new Audio("../audio/Turn_river.wav");

    this.m_audioWinnerTakePot = new Audio("../audio/Winner_take_the_pot.wav");

    this.m_audioCall = new Audio("../audio/Actions/call.wav");

    this.m_audioCheck = new Audio("../audio/Actions/check.wav");

    this.m_audioRaise = new Audio("../audio/Actions/Raise.wav");
  }

  playCardDealt()
  {
    if (soundEnable)
      this.m_audioCardDealt.play();
  }

  playEndStreet()
  {
    if (soundEnable)
      this.m_audioEndStreet.play();
  }

  playFlop()
  {
    if (soundEnable)
      this.m_audioFlop.play();
  }

  playTurnRiver()
  {
    if (soundEnable)
      this.m_audioTurnRiver.play();
  }

  playWinnerPot()
  {
    if (soundEnable)
      this.m_audioWinnerTakePot.play();
  }

  playCall()
  {
    if (soundEnable)
      this.m_audioCall.play();
  }

  playCheck()
  {
    if (soundEnable)
      this.m_audioCheck.play();
  }

  playRaise()
  {
    if (soundEnable)
      this.m_audioRaise.play();
  }
}
