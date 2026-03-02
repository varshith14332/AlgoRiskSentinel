"""
AlgoRisk Sentinel — Smart Contract Deployment Script
Deploys alert_contract and nft_contract to Algorand TestNet using algosdk.
"""
import os
import sys

try:
    import algosdk
    from algosdk.v2client import algod
    from algosdk import transaction, mnemonic
except ImportError:
    print("Install algosdk: pip install py-algorand-sdk")
    sys.exit(1)


ALGOD_ADDRESS = os.getenv("ALGORAND_SERVER", "https://testnet-api.algonode.cloud")
ALGOD_TOKEN = os.getenv("ALGORAND_TOKEN", "")
MNEMONIC = os.getenv("ALGORAND_MNEMONIC", "")


def get_client():
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


def compile_teal(client, source):
    response = client.compile(source)
    return response["result"]


def deploy_contract(client, sender, private_key, approval_file, clear_file):
    """Deploy a smart contract to Algorand."""
    with open(approval_file, "r") as f:
        approval_source = f.read()
    with open(clear_file, "r") as f:
        clear_source = f.read()

    approval_compiled = compile_teal(client, approval_source)
    clear_compiled = compile_teal(client, clear_source)

    import base64
    approval_program = base64.b64decode(approval_compiled)
    clear_program = base64.b64decode(clear_compiled)

    params = client.suggested_params()

    # Global schema: 64 key-value pairs, Local schema: 0
    global_schema = transaction.StateSchema(num_uints=16, num_byte_slices=48)
    local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)

    txn = transaction.ApplicationCreateTxn(
        sender=sender,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema,
    )

    signed = txn.sign(private_key)
    tx_id = client.send_transaction(signed)
    result = transaction.wait_for_confirmation(client, tx_id, 4)

    app_id = result["application-index"]
    return app_id, tx_id


def main():
    if not MNEMONIC:
        print("❌ Set ALGORAND_MNEMONIC environment variable")
        print("   Generate a TestNet account at https://bank.testnet.algorand.network/")
        return

    client = get_client()
    private_key = mnemonic.to_private_key(MNEMONIC)
    sender = algosdk.account.address_from_private_key(private_key)

    print(f"🔑 Deploying from: {sender}")
    print(f"🌐 Network: {ALGOD_ADDRESS}")

    # First compile the PyTeal contracts
    print("\n📝 Compiling contracts...")
    os.system("python alert_contract.py")
    os.system("python nft_contract.py")

    # Deploy Alert Contract
    print("\n🚀 Deploying Alert Registry Contract...")
    try:
        app_id, tx_id = deploy_contract(
            client, sender, private_key,
            "build/alert_approval.teal", "build/alert_clear.teal"
        )
        print(f"   ✅ Alert Contract App ID: {app_id}")
        print(f"   📜 Transaction: {tx_id}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")

    # Deploy NFT Contract
    print("\n🚀 Deploying Risk Alert NFT Contract...")
    try:
        app_id, tx_id = deploy_contract(
            client, sender, private_key,
            "build/nft_approval.teal", "build/nft_clear.teal"
        )
        print(f"   ✅ NFT Contract App ID: {app_id}")
        print(f"   📜 Transaction: {tx_id}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")

    print("\n✅ Deployment complete!")


if __name__ == "__main__":
    main()
