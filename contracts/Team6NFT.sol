// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IVolcanoCoin {
    function transfer(uint256 _amount, address _recipient) external;

    function transferFrom(
        uint256 _amount,
        address _sender,
        address _recipient
    ) external;

    function allowance(address _from, address _to)
        external
        view
        returns (uint256);
}

contract Team6NFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    IVolcanoCoin private immutable vcContract;

    constructor(address _volcanoCoinAddress) ERC721("Team 6 NFT", "T6NFT") {
        vcContract = IVolcanoCoin(_volcanoCoinAddress);
    }

    function safeMint(address to, string memory uri) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function mintWithEth(address to, string memory uri)
        public
        payable
        ethThreshold
    {
        safeMint(to, uri);
    }

    function mintWithVolcanoCoin(address to, string memory uri)
        public
        payable
        volcanoCoinThreshold
    {
        vcContract.transferFrom(1, msg.sender, address(this));
        safeMint(to, uri);
    }

    modifier volcanoCoinThreshold() {
        require(
            vcContract.allowance(msg.sender, address(this)) >= 1,
            "There needs to be at least some Volcano Coin Allowance, you know? Even 1 would do."
        );
        _;
    }

    modifier ethThreshold() {
        require(msg.value >= 0.01 * (10**18), "Pay more you dumbass");
        _;
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
