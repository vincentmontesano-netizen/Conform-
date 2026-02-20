from app.engine.rules.rps_detection import RPSDetectionRule
from app.models.request import EvaluationRequest, CompanyContext, RiskItem, ActionItem


def make_request(risks=None, actions=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=20,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=risks or [],
        actions=actions or [],
        duerp_last_validated_at=None,
    )


def make_rps_risk(risk_id="r1", work_unit="Bureau"):
    return RiskItem(
        risk_id=risk_id,
        category="RPS",
        severity="eleve",
        probability="probable",
        is_rps=True,
        work_unit_name=work_unit,
    )


def make_action(action_id="a1", status="a_faire"):
    return ActionItem(
        action_id=action_id,
        name="Action preventive",
        is_critical=False,
        has_proof=False,
        status=status,
    )


def test_no_rps_risks_passes():
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(risks=[], actions=[]))
    assert result.passed is True
    assert result.severity == "info"


def test_rps_without_actions_fails():
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(
        risks=[make_rps_risk()],
        actions=[],
    ))
    assert result.passed is False
    assert result.severity == "critical"
    assert result.details["rps_count"] == 1


def test_rps_with_completed_only_fails():
    """Actions that are terminee/annulee don't count as active."""
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(
        risks=[make_rps_risk()],
        actions=[make_action(status="terminee")],
    ))
    assert result.passed is False
    assert result.severity == "critical"


def test_rps_with_active_actions_passes():
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(
        risks=[make_rps_risk()],
        actions=[make_action(status="a_faire")],
    ))
    assert result.passed is True
    assert result.severity == "info"


def test_rps_with_en_cours_actions_passes():
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(
        risks=[make_rps_risk()],
        actions=[make_action(status="en_cours")],
    ))
    assert result.passed is True


def test_multiple_rps_risks():
    rule = RPSDetectionRule()
    result = rule.evaluate(make_request(
        risks=[
            make_rps_risk("r1", "Bureau"),
            make_rps_risk("r2", "Atelier"),
        ],
        actions=[],
    ))
    assert result.passed is False
    assert result.details["rps_count"] == 2
    assert len(result.details["rps_work_units"]) == 2


def test_mixed_rps_and_non_rps():
    """Non-RPS risks should be ignored."""
    rule = RPSDetectionRule()
    non_rps = RiskItem(
        risk_id="r2",
        category="Chute",
        severity="modere",
        probability="improbable",
        is_rps=False,
        work_unit_name="Entrepot",
    )
    result = rule.evaluate(make_request(
        risks=[make_rps_risk(), non_rps],
        actions=[],
    ))
    assert result.passed is False
    assert result.details["rps_count"] == 1
