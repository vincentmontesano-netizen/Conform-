from app.engine.rules.critical_action import CriticalActionRule
from app.models.request import EvaluationRequest, CompanyContext, ActionItem


def make_request(actions=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=20,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=[],
        actions=actions or [],
        duerp_last_validated_at=None,
    )


def make_action(is_critical=True, has_proof=False, name="Action test"):
    return ActionItem(
        action_id="a1",
        name=name,
        is_critical=is_critical,
        has_proof=has_proof,
        status="a_faire",
    )


def test_no_actions_passes():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(actions=[]))
    assert result.passed is True
    assert result.severity == "info"


def test_non_critical_actions_pass():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(
        actions=[make_action(is_critical=False, has_proof=False)],
    ))
    assert result.passed is True


def test_critical_with_proof_passes():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(
        actions=[make_action(is_critical=True, has_proof=True)],
    ))
    assert result.passed is True


def test_critical_without_proof_fails():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(
        actions=[make_action(is_critical=True, has_proof=False, name="Action urgente")],
    ))
    assert result.passed is False
    assert result.severity == "warning"
    assert "Action urgente" in result.details["actions_without_proof"]


def test_multiple_critical_mixed():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(
        actions=[
            make_action(is_critical=True, has_proof=True, name="OK"),
            make_action(is_critical=True, has_proof=False, name="Missing"),
        ],
    ))
    assert result.passed is False
    assert len(result.details["actions_without_proof"]) == 1
    assert "Missing" in result.details["actions_without_proof"]


def test_all_critical_with_proof():
    rule = CriticalActionRule()
    result = rule.evaluate(make_request(
        actions=[
            make_action(is_critical=True, has_proof=True, name="A"),
            make_action(is_critical=True, has_proof=True, name="B"),
        ],
    ))
    assert result.passed is True
