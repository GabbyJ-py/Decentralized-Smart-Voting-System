// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VotingContract
 * @dev Decentralized voting system with double-vote prevention
 */
contract VotingContract {
    
    // Candidate structure
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    
    // State variables
    address public admin;
    uint256 public candidatesCount;
    
    // Mappings
    mapping(uint256 => Candidate) public candidates;
    mapping(string => bool) public hasVoted;
    
    // Events
    event VoteCast(
        string indexed voterHash,
        uint256 indexed candidateId,
        uint256 timestamp
    );
    
    event CandidateAdded(
        uint256 indexed candidateId,
        string name
    );
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier validCandidate(uint256 _candidateId) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        _;
    }
    
    /**
     * @dev Constructor - Initialize contract with candidates
     * @param _candidateNames Array of candidate names
     */
    constructor(string[] memory _candidateNames) {
        admin = msg.sender;
        
        // Add all candidates
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidatesCount++;
            candidates[candidatesCount] = Candidate(candidatesCount, _candidateNames[i], 0);
            emit CandidateAdded(candidatesCount, _candidateNames[i]);
        }
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param _voterHash Unique hash of the voter (prevents double voting)
     * @param _candidateId ID of the candidate to vote for
     */
    function castVote(string memory _voterHash, uint256 _candidateId) 
        public 
        validCandidate(_candidateId) 
    {
        // Check if voter has already voted
        require(!hasVoted[_voterHash], "Double-voting detected: This voter has already cast a ballot");
        
        // Mark voter as having voted
        hasVoted[_voterHash] = true;
        
        // Increment candidate vote count
        candidates[_candidateId].voteCount++;
        
        // Emit event for transparency
        emit VoteCast(_voterHash, _candidateId, block.timestamp);
    }
    
    /**
     * @dev Get candidate details
     * @param _candidateId ID of the candidate
     * @return id Candidate ID
     * @return name Candidate name
     * @return voteCount Number of votes received
     */
    function getCandidate(uint256 _candidateId) 
        public 
        view 
        validCandidate(_candidateId)
        returns (uint256 id, string memory name, uint256 voteCount) 
    {
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }
    
    /**
     * @dev Get total number of candidates
     * @return Total candidate count
     */
    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }
    
    /**
     * @dev Check if a voter has already voted
     * @param _voterHash Unique hash of the voter
     * @return Boolean indicating if voter has voted
     */
    function checkHasVoted(string memory _voterHash) public view returns (bool) {
        return hasVoted[_voterHash];
    }
    
    /**
     * @dev Get all results
     * @return ids Array of candidate IDs
     * @return names Array of candidate names
     * @return voteCounts Array of vote counts
     */
    function getResults() 
        public 
        view 
        returns (
            uint256[] memory ids,
            string[] memory names,
            uint256[] memory voteCounts
        ) 
    {
        ids = new uint256[](candidatesCount);
        names = new string[](candidatesCount);
        voteCounts = new uint256[](candidatesCount);
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            Candidate memory c = candidates[i];
            ids[i - 1] = c.id;
            names[i - 1] = c.name;
            voteCounts[i - 1] = c.voteCount;
        }
        
        return (ids, names, voteCounts);
    }
    
    /**
     * @dev Add a new candidate (admin only)
     * @param _name Name of the candidate
     */
    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }
}
