pragma solidity ^0.4.24;

import "oraclize-api/usingOraclize.sol";
import "./Evidencable.sol";

contract YouTubeEvidences is usingOraclize {
    string private constant HTML = "html(https://www.youtube.com/watch?v=";
    string private constant XPATH = ").xpath(count(//div[contains(@id,'description')]//a[contains(@href,'";

    mapping(bytes32=>YouTubeEvidence) public evidences;

    struct YouTubeEvidence {
        address registry;
        string evidencedId;
        string videoId;
        bool isPending;
        bool isVerified;
    }

    event OraclizeQuery(bytes32 evidenceId);

    event YouTubeEvidenceEvent(bytes32 evidenceId, bytes32 indexed evidencedIdHash, string videoId);

    constructor(uint gasPrice) public {
        oraclize_setCustomGasPrice(gasPrice);
    }

    /// @notice Callback for the oracle for query `evidenceId` including the `properLinksCount
    /// amount of links to the manifestation hash from the YouTube video description.
    /// @dev There should be at least one proper link for the YouTubeEvidence to be verified.
    /// @param evidenceId The identifier of the oracle query
    /// @param properLinksCount The amount of proper links in the YouTube video description
    function __callback(bytes32 evidenceId, string properLinksCount) public {
        require(msg.sender == oraclize_cbAddress());
        require(evidences[evidenceId].isPending);
        evidences[evidenceId].isPending = false;

        if (parseInt(properLinksCount) > 0) {
            Evidencable(evidences[evidenceId].registry)
                .addEvidence(evidences[evidenceId].evidencedId);
            evidences[evidenceId].isVerified = true;
            emit YouTubeEvidenceEvent(evidenceId, keccak256(evidences[evidenceId].evidencedId),
                evidences[evidenceId].videoId);
        }
    }

    /// @notice Check using an oracle if the YouTube `videoId` is linked to the manifestation `hash`.
    /// @dev The oracle checks if the YouTube page for the video contains a link in its description
    /// pointing to the manifestation hash.
    /// @param registry The address of the contract holding the items evidenced
    /// @param evidencedId The identifier used by the registry contract for the item receiving evidence
    /// @param videoId The identifier of a YouTube video to be checked
    function check(address registry, string evidencedId, string videoId, uint gaslimit) public payable {
        require(address(this).balance >= oraclize_getPrice("URL", gaslimit), "Not enough funds to run Oraclize query");
        string memory query = strConcat(HTML, videoId, XPATH, evidencedId, "')]))");
        bytes32 evidenceId = oraclize_query("URL", query, gaslimit);
        evidences[evidenceId] = YouTubeEvidence(registry, evidencedId, videoId, true, false);
        emit OraclizeQuery(evidenceId);
    }

    function getPrice(uint gaslimit) public constant returns (uint) {
        return oraclize_getPrice("URL", gaslimit);
    }
}
