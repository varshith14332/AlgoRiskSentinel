"""
AlgoRisk Sentinel — Alert Smart Contract (PyTeal / Algokit)
Logs verified risk alerts on Algorand blockchain.
Stores: shipmentID, riskScore, riskType, severity, timestamp, alertHash
"""
from pyteal import *


def approval_program():
    """
    Application approval program for the Risk Alert Registry.
    Supports: create, log_alert, verify_alert
    """

    # Global state keys
    alert_count_key = Bytes("alert_count")

    # ── On Creation ──
    on_create = Seq([
        App.globalPut(alert_count_key, Int(0)),
        Approve(),
    ])

    # ── Log Alert ──
    # Args: shipmentID, riskScore, riskType, severity, alertHash
    shipment_id = Txn.application_args[1]
    risk_score = Txn.application_args[2]
    risk_type = Txn.application_args[3]
    severity = Txn.application_args[4]
    alert_hash = Txn.application_args[5]

    current_count = App.globalGet(alert_count_key)

    # Store alert data using box storage pattern (shipmentID as key)
    on_log_alert = Seq([
        Assert(Txn.application_args.length() == Int(6)),
        # Store alert hash mapped to shipment ID
        App.globalPut(
            Concat(Bytes("alert_"), shipment_id),
            alert_hash,
        ),
        # Store risk score
        App.globalPut(
            Concat(Bytes("score_"), shipment_id),
            risk_score,
        ),
        # Store risk type
        App.globalPut(
            Concat(Bytes("type_"), shipment_id),
            risk_type,
        ),
        # Store severity
        App.globalPut(
            Concat(Bytes("sev_"), shipment_id),
            severity,
        ),
        # Increment alert count
        App.globalPut(alert_count_key, current_count + Int(1)),
        Approve(),
    ])

    # ── Verify Alert ──
    # Args: shipmentID — returns stored hash for verification
    verify_id = Txn.application_args[1]
    stored_hash = App.globalGet(Concat(Bytes("alert_"), verify_id))

    on_verify = Seq([
        Assert(stored_hash != Bytes("")),
        Log(stored_hash),
        Approve(),
    ])

    # ── Router ──
    action = Txn.application_args[0]

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [action == Bytes("log_alert"), on_log_alert],
        [action == Bytes("verify"), on_verify],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
    )

    return program


def clear_program():
    return Approve()


if __name__ == "__main__":
    import os
    # Compile to TEAL
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=10)
    clear_teal = compileTeal(clear_program(), mode=Mode.Application, version=10)

    os.makedirs("build", exist_ok=True)
    with open("build/alert_approval.teal", "w") as f:
        f.write(approval_teal)
    with open("build/alert_clear.teal", "w") as f:
        f.write(clear_teal)

    print("✅ Alert contract compiled to build/")
