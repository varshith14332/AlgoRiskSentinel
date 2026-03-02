"""
AlgoRisk Sentinel — Risk Alert NFT Contract
Mints an NFT as immutable evidence when a high-risk alert occurs.
NFT metadata: shipmentID, riskType, riskScore, timestamp, alertHash
"""
from pyteal import *


def nft_approval_program():
    """
    Application for minting Risk Alert NFTs.
    Uses Algorand ASAs (Algorand Standard Assets) for NFT creation.
    """

    # Global state
    nft_count_key = Bytes("nft_count")

    # ── On Creation ──
    on_create = Seq([
        App.globalPut(nft_count_key, Int(0)),
        Approve(),
    ])

    # ── Mint NFT ──
    # This logs the NFT metadata on-chain. Actual ASA creation happens
    # via an inner transaction in a real deployment.
    shipment_id = Txn.application_args[1]
    risk_type = Txn.application_args[2]
    risk_score = Txn.application_args[3]
    alert_hash = Txn.application_args[4]

    current_nft_count = App.globalGet(nft_count_key)

    on_mint = Seq([
        Assert(Txn.application_args.length() == Int(5)),
        # Store NFT metadata
        App.globalPut(
            Concat(Bytes("nft_"), shipment_id),
            Concat(
                Bytes("risk:"), risk_type,
                Bytes("|score:"), risk_score,
                Bytes("|hash:"), alert_hash,
            ),
        ),
        # Log the minting event
        Log(Concat(
            Bytes("NFT_MINTED:"),
            shipment_id,
            Bytes(":"),
            alert_hash,
        )),
        App.globalPut(nft_count_key, current_nft_count + Int(1)),
        Approve(),
    ])

    # ── Lookup NFT ──
    lookup_id = Txn.application_args[1]
    nft_data = App.globalGet(Concat(Bytes("nft_"), lookup_id))

    on_lookup = Seq([
        Assert(nft_data != Bytes("")),
        Log(nft_data),
        Approve(),
    ])

    # ── Router ──
    action = Txn.application_args[0]

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [action == Bytes("mint"), on_mint],
        [action == Bytes("lookup"), on_lookup],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
    )

    return program


def nft_clear_program():
    return Approve()


if __name__ == "__main__":
    import os
    approval_teal = compileTeal(nft_approval_program(), mode=Mode.Application, version=10)
    clear_teal = compileTeal(nft_clear_program(), mode=Mode.Application, version=10)

    os.makedirs("build", exist_ok=True)
    with open("build/nft_approval.teal", "w") as f:
        f.write(approval_teal)
    with open("build/nft_clear.teal", "w") as f:
        f.write(clear_teal)

    print("✅ NFT contract compiled to build/")
