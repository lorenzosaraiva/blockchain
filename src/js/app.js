App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      //ethereum.enable()
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },



  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.addedUser({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event.args.msg)
        App.render();
      });
    });
  },

  donate: function() {
    var partyCnpj = $('#donationSelect').val();
    var userCpf = $('#donationcpf').val();
    var amount = $('#donationamount').val();

    if (isNaN(amount)){
      console.log("Digite um número no campo de quantidade.");
      return;
    }
    
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addDonation(userCpf,partyCnpj, { from: App.account, value: amount });
    }).then(function(result) {
    // Wait for donations to update
      App.render();
    })
  },

  addUser: function(){
    var userCpf = $('#newUserCpf').val();
    var result = testaCPF(userCpf);
    if(!result){
          console.log("CPF inválido.")
          return;
    }
    //Fazer processo de facial rec
    App.contracts.Election.deployed().then(function(instance) {
      return instance.newUser(userCpf, { from: App.account });
    })
  },

  createParty: function(){
    App.contracts.Election.deployed().then(function(instance) {
      return instance.createParty();
    })
  },

  render: async function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      App.account = account;
      $("#accountAddress").html("Your Account: " + account);
      }
    });
    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.donationCount();
    }).then(function(donationCount) {
      var donationResults = $("#donationResults");
      donationResults.empty();
      for (var i = 1; i <= donationCount; i++) {
        electionInstance.donationList(i).then(function(donation) {
          var amount = donation[1];
          var user = donation[2];
          var party = donation[3];

          // Render candidate Result
          var donationTemplate = "<tr><th>" + amount + "</th><td>" + user + "</td><td>" + party + "</td></tr>"
          donationResults.append(donationTemplate);

        });
      }
      return electionInstance.partyCount();
    }).then(function(partyCount) {
      // Do not allow a user to vote
      console.log(partyCount);
      var donationSelect = $('#donationSelect');
      donationSelect.empty();

      for (var i = 1; i <= partyCount; i++) {
        electionInstance.partyList(i).then(function(party) {
          var cnpj = party[1];
          var name = party[2];

          // Render candidate ballot option
          var partyOption = "<option value='" + cnpj + "' >" + name + "</ option>"
          donationSelect.append(partyOption);
        });
      }
    }).catch(function(error) {
      console.warn(error);
    });
    content.show();
    loader.hide();
  }
};

function testaCPF(strCPF) {
   var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000") return false;
     
  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
   
  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});