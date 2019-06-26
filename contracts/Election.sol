pragma solidity 0.5.8;

contract Election {
    // Read/write candidate
    string public candidate;


    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct User {
    	uint id;
        uint cpf;
        address account;
    }

    struct Party {
    	uint id;
    	uint cnpj;
    	string name;
    }

    struct Donation {
    	uint id;
    	uint amount;
    	uint userCpf;
    	uint partyCpnj;
    }


    event addedUser (
        uint msg
    );

    event errorUser(
    	string msg
    );

    event donationAdded(
    	string msg
    );

    event donationError(
    	string msg
    );
    

    mapping(uint => Candidate) public candidates;
    mapping(address => uint) public registeredUsers;
    mapping(uint => address) public cpfToAddress;
    mapping(address => bool) public voters;
    mapping(uint => User) public userList;
    mapping(uint => Party) public partyList;
    mapping(uint => address payable) public registeredParties;
    mapping(uint => Donation) public donationList;


    uint public userCount;
    uint public partyCount;
    uint public donationCount;
    uint public candidatesCount;

    // Constructor
    constructor () public {
    	partyCount++;
       	partyList[partyCount] = Party(partyCount, 293239784, "P1");
       	registeredParties[293239784] = 0x34b57b3609724fbb05629d4CD6F84F598f0badE8;
       	partyCount++;
       	partyList[partyCount] = Party(partyCount, 34214, "P2");
       	registeredParties[34214] = 0x3e6282C94a0676ba83942d51F61dC5f584678ac9;
       	partyCount++;
      	partyList[partyCount] = Party(partyCount, 5555555, "P3");
      	registeredParties[5555555] = 0x57Ea72479CC9dd1e4B5530F1639dc97440A46369;
    }

    function addUser (uint cpf) public {
        userCount++;
        userList[userCount] = User(userCount, cpf, msg.sender);
    }

    function newUser (uint cpf) public {
    	if(registeredUsers[msg.sender] == 0){
    		userCount++;
	    	registeredUsers[msg.sender] = cpf;
	    	cpfToAddress[cpf] = msg.sender;
	    	//emit addedUser(cpf);
    	}else{

    		if(cpfToAddress[cpf] != msg.sender){
    			//emit errorUser("CPF cadastrado com outro endereço.");
    			return;
    		}
    		if(registeredUsers[msg.sender] != cpf){
    			//emit errorUser("Endereço registrado para outro cpf.");
    			return;
    		}

    		if(registeredUsers[msg.sender] == cpf){
    			//emit errorUser("Usuário já registrado com este endereço.");
    			return;
    		}
    	}	
    }

   	function addParty (string memory name, uint cnpj) private {
        partyCount++;
        partyList[partyCount] = Party(partyCount, cnpj, name);        
    }

    function addDonation (uint userCpf, uint partyCnpj) payable public {
    	if(registeredUsers[msg.sender] == userCpf){
    		address payable party = registeredParties[partyCnpj];
    		party.transfer(msg.value);
    		donationCount++;
        	donationList[donationCount] = Donation(donationCount, msg.value, userCpf, partyCnpj);
        	emit donationAdded("Doação realizada com sucesso.");
    	}else{
    		emit donationError("Doação falhou.");
    	}
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    	
    	// trigger voted event

    }
}