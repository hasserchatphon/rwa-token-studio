// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Educational reference only. Not audited and not production-ready.
contract RwaAssetToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isAllowlisted;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AllowlistUpdated(address indexed account, bool allowed);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyAllowedTransfer(address from, address to) {
        require(from == address(0) || isAllowlisted[from], "sender restricted");
        require(to == address(0) || isAllowlisted[to], "recipient restricted");
        _;
    }

    constructor(string memory tokenName, string memory tokenSymbol, address initialOwner) {
        require(initialOwner != address(0), "owner required");
        name = tokenName;
        symbol = tokenSymbol;
        owner = initialOwner;
        isAllowlisted[initialOwner] = true;
        emit AllowlistUpdated(initialOwner, true);
    }

    function setAllowlisted(address account, bool allowed) external onlyOwner {
        require(account != address(0), "account required");
        isAllowlisted[account] = allowed;
        emit AllowlistUpdated(account, allowed);
    }

    function mint(address to, uint256 amount) external onlyOwner onlyAllowedTransfer(address(0), to) {
        require(to != address(0), "recipient required");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "spender required");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "allowance exceeded");
        allowance[from][msg.sender] = currentAllowance - amount;
        _transfer(from, to, amount);
        return true;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "owner required");
        address previousOwner = owner;
        owner = newOwner;
        isAllowlisted[newOwner] = true;
        emit OwnershipTransferred(previousOwner, newOwner);
        emit AllowlistUpdated(newOwner, true);
    }

    function _transfer(address from, address to, uint256 amount) private onlyAllowedTransfer(from, to) {
        require(to != address(0), "recipient required");
        require(balanceOf[from] >= amount, "balance too low");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}

