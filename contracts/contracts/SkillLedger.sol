// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  SkillLedger
  - ERC-721 credentials (Soulbound / non-transferable)
  - Role-based institutions issue credentials
  - EIP-712 signed contributions
  - Deterministic reputation score
  - Public verification APIs
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/* ───────────────────────── Interface ───────────────────────── */

interface ISkillLedger {
    function verifyCredential(uint256 tokenId)
        external
        view
        returns (
            bool valid,
            address learner,
            address issuer,
            bytes32 credentialHash,
            uint64 issuedAt
        );

    function reputationScore(address learner) external view returns (uint256);
}

/* ───────────────────────── Contract ───────────────────────── */

contract SkillLedger is
    ERC721,
    AccessControl,
    EIP712,
    ReentrancyGuard,
    ISkillLedger
{
    using ECDSA for bytes32;

    /* ───────────── Roles ───────────── */

    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    /* ───────────── EIP-712 ───────────── */

    bytes32 private constant CONTRIBUTION_TYPEHASH =
        keccak256(
            "Contribution(address learner,uint64 timestamp,uint32 kind,uint32 weight,bytes32 ref)"
        );

    /* ───────────── Structs ───────────── */

    struct Credential {
        address issuer;
        bytes32 credentialHash;
        uint64 issuedAt;
        uint16 level;
        uint16 category;
        bool revoked;
    }

    /* ───────────── Storage ───────────── */

    uint256 private _nextTokenId = 1;

    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) private _ownedCredentialIds;

    mapping(address => uint256) public credentialScoreSum;
    mapping(address => uint256) public credentialCount;

    mapping(address => uint256) public contributionScoreSum;
    mapping(address => uint256) public contributionCount;

    mapping(address => mapping(bytes32 => bool)) public usedRefs;

    /* ───────────── Events ───────────── */

    event InstitutionAdded(address indexed institution);
    event InstitutionRemoved(address indexed institution);

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed learner,
        address indexed issuer,
        bytes32 credentialHash,
        uint16 level,
        uint16 category,
        uint64 issuedAt
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed issuer,
        uint64 revokedAt
    );

    event ContributionLogged(
        address indexed learner,
        address indexed logger,
        uint32 kind,
        uint32 weight,
        bytes32 ref,
        uint64 timestamp
    );

    /* ───────────── Constructor ───────────── */

    constructor(address admin)
        ERC721("SkillLedger Credential", "SKILL-CRED")
        EIP712("SkillLedger", "1")
    {
        _grantRole(ADMIN_ROLE, admin);
    }

    /* ───────────── Interface Support ───────────── */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(ISkillLedger).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /* ───────────── Soulbound Enforcement (OZ v4) ───────────── */

    function approve(address, uint256) public pure override {
        revert("SBT: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: approvals disabled");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // block transfers (allow mint & burn only)
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
    }

    /* ───────────── Admin ───────────── */

    function addInstitution(address institution)
        external
        onlyRole(ADMIN_ROLE)
    {
        _grantRole(INSTITUTION_ROLE, institution);
        emit InstitutionAdded(institution);
    }

    function removeInstitution(address institution)
        external
        onlyRole(ADMIN_ROLE)
    {
        _revokeRole(INSTITUTION_ROLE, institution);
        emit InstitutionRemoved(institution);
    }

    /* ───────────── Credentials ───────────── */

    function issueCredential(
        address learner,
        bytes32 credentialHash,
        uint16 level,
        uint16 category
    ) external nonReentrant onlyRole(INSTITUTION_ROLE) returns (uint256 tokenId) {
        require(learner != address(0), "bad learner");
        require(credentialHash != bytes32(0), "bad hash");
        require(level >= 1 && level <= 100, "level 1..100");

        tokenId = _nextTokenId++;
        _safeMint(learner, tokenId);

        uint64 ts = uint64(block.timestamp);

        credentials[tokenId] = Credential({
            issuer: msg.sender,
            credentialHash: credentialHash,
            issuedAt: ts,
            level: level,
            category: category,
            revoked: false
        });

        _ownedCredentialIds[learner].push(tokenId);

        credentialScoreSum[learner] += uint256(level) * 10;
        credentialCount[learner] += 1;

        emit CredentialIssued(
            tokenId,
            learner,
            msg.sender,
            credentialHash,
            level,
            category,
            ts
        );
    }

    function revokeCredential(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "no token");

        Credential storage c = credentials[tokenId];
        require(!c.revoked, "already revoked");
        require(
            msg.sender == c.issuer || hasRole(ADMIN_ROLE, msg.sender),
            "no auth"
        );

        c.revoked = true;

        address learner = ownerOf(tokenId);
        credentialScoreSum[learner] -= uint256(c.level) * 10;
        credentialCount[learner] -= 1;

        emit CredentialRevoked(tokenId, msg.sender, uint64(block.timestamp));
    }

    /* ───────────── Contributions ───────────── */

    function logContributionWithSig(
        address learner,
        uint64 timestamp,
        uint32 kind,
        uint32 weight,
        bytes32 ref,
        bytes calldata signature
    ) external nonReentrant {
        require(learner != address(0), "bad learner");
        require(ref != bytes32(0), "bad ref");
        require(!usedRefs[learner][ref], "ref used");
        require(weight >= 1 && weight <= 1000, "weight 1..1000");
        require(timestamp <= block.timestamp + 10 minutes, "future ts");

        bytes32 structHash = keccak256(
            abi.encode(
                CONTRIBUTION_TYPEHASH,
                learner,
                timestamp,
                kind,
                weight,
                ref
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        require(signer == learner, "bad sig");

        usedRefs[learner][ref] = true;

        uint256 points = uint256(weight) * _kindMultiplier(kind);
        contributionScoreSum[learner] += points;
        contributionCount[learner] += 1;

        emit ContributionLogged(
            learner,
            msg.sender,
            kind,
            weight,
            ref,
            timestamp
        );
    }

    function logContributionTrusted(
        address learner,
        uint32 kind,
        uint32 weight,
        bytes32 ref
    ) external nonReentrant {
        require(
            hasRole(INSTITUTION_ROLE, msg.sender) ||
                hasRole(ADMIN_ROLE, msg.sender),
            "no auth"
        );

        require(learner != address(0), "bad learner");
        require(ref != bytes32(0), "bad ref");
        require(!usedRefs[learner][ref], "ref used");
        require(weight >= 1 && weight <= 1000, "weight 1..1000");

        usedRefs[learner][ref] = true;

        uint256 points = uint256(weight) * _kindMultiplier(kind);
        contributionScoreSum[learner] += points;
        contributionCount[learner] += 1;

        emit ContributionLogged(
            learner,
            msg.sender,
            kind,
            weight,
            ref,
            uint64(block.timestamp)
        );
    }

    function _kindMultiplier(uint32 kind) internal pure returns (uint256) {
        if (kind == 1) return 3;
        if (kind == 2) return 4;
        if (kind == 3) return 5;
        if (kind == 4) return 5;
        return 2;
    }

    /* ───────────── Verification ───────────── */

    function verifyCredential(uint256 tokenId)
        external
        view
        override
        returns (
            bool valid,
            address learner,
            address issuer,
            bytes32 credentialHash,
            uint64 issuedAt
        )
    {
        if (!_exists(tokenId)) {
            return (false, address(0), address(0), bytes32(0), 0);
        }

        Credential memory c = credentials[tokenId];
        learner = ownerOf(tokenId);
        valid = !c.revoked && c.issuer != address(0);

        return (valid, learner, c.issuer, c.credentialHash, c.issuedAt);
    }

    function credentialsOf(address learner)
        external
        view
        returns (uint256[] memory)
    {
        return _ownedCredentialIds[learner];
    }

    /* ───────────── Reputation ───────────── */

    function reputationScore(address learner)
        public
        view
        override
        returns (uint256)
    {
        uint256 base = credentialCount[learner] > 0 ? 200 : 0;
        uint256 cred = credentialScoreSum[learner];
        uint256 contrib = _isqrt(contributionScoreSum[learner]) * 20;

        uint256 total = base + cred + contrib;
        return total > 10000 ? 10000 : total;
    }

    function _isqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /* ───────────── Token URI ───────────── */

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "no token");

        Credential memory c = credentials[tokenId];

        return
            string(
                abi.encodePacked(
                    "data:text/plain,SkillLedger%20Credential%20#",
                    Strings.toString(tokenId),
                    "%20hash%3A0x",
                    _toHex32(c.credentialHash)
                )
            );
    }

    function _toHex32(bytes32 data) internal pure returns (string memory) {
        bytes memory HEX = "0123456789abcdef";
        bytes memory out = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            uint8 b = uint8(data[i]);
            out[i * 2] = HEX[b >> 4];
            out[i * 2 + 1] = HEX[b & 0x0f];
        }
        return string(out);
    }
}
