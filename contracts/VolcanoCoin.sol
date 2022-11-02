// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract VolcanoCoin {
    uint256 private totalSupply = 10000;
    address private immutable owner;
    mapping(address => uint256) private balances;
    mapping(address => Payment[]) private transfers;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Mint(uint256 newTotalSupply);
    event Transfer(
        uint256 amount,
        address indexed sender,
        address indexed recipient
    );

    struct Payment {
        uint256 amount;
        address recipient;
    }

    constructor() {
        owner = msg.sender;
        balances[msg.sender] = totalSupply;
    }

    function mint() public onlyOwner {
        totalSupply += 1000;
        balances[owner] += 1000;
        emit Mint(totalSupply);
    }

    function getAccountBalance(address _account) public view returns (uint256) {
        require(msg.sender == _account, "Stop counting someone else's pockets");
        return balances[_account];
    }

    function getAccountTransfers(address _account)
        public
        view
        returns (Payment[] memory)
    {
        require(msg.sender == _account, "Stop counting someone else's pockets");
        return transfers[_account];
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function transfer(uint256 _amount, address _recipient) public {
        require(
            _amount <= balances[msg.sender],
            "You are trying to transfer more tokens than the amount that you have"
        );
        balances[msg.sender] -= _amount;
        balances[_recipient] += _amount;
        transfers[msg.sender].push(Payment(_amount, _recipient));
        emit Transfer(_amount, msg.sender, _recipient);
    }

    function transferFrom(
        uint256 _amount,
        address _sender,
        address _recipient
    ) public {
        require(
            _amount <= _allowances[_sender][msg.sender],
            "You are trying to transfer more tokens than the amount that you have"
        );
        _allowances[_sender][msg.sender] -= _amount;
        balances[_recipient] += _amount;
        transfers[_sender].push(Payment(_amount, _recipient));
        emit Transfer(_amount, _sender, _recipient);
    }

    function allowance(address _from, address _to)
        external
        view
        returns (uint256)
    {
        return _allowances[_from][_to];
    }

    function allow(uint256 _amount, address _recipient) public {
        require(
            _amount <= balances[msg.sender],
            "You are trying to transfer more tokens than the amount that you have"
        );
        _allowances[msg.sender][_recipient] += _amount;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Someone who is not an owner tried to execute an owner only function"
        );
        _;
    }
}
