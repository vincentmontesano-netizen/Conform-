from app.engine.rules.formation_expiry import FormationExpiryRule
from app.models.request import EvaluationRequest, CompanyContext, FormationContext

def make_request(formations=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=10,
            has_physical_site=True,
            sector="industrie",
        ),
        risks=[],
        actions=[],
        formations=formations,
    )

def test_pass_no_formation_data():
    rule = FormationExpiryRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_valid():
    rule = FormationExpiryRule()
    f = FormationContext(total_employees=10, expired_formations=0, expired_habilitations=0, missing_obligatoires=0, global_score=95)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is True

def test_fail_expired_formations():
    rule = FormationExpiryRule()
    f = FormationContext(total_employees=10, expired_formations=3, expired_habilitations=0, missing_obligatoires=0, global_score=70)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is False
    assert result.severity == "critical"
    assert "3 formation" in result.message

def test_fail_expired_habilitations():
    rule = FormationExpiryRule()
    f = FormationContext(total_employees=10, expired_formations=0, expired_habilitations=2, missing_obligatoires=0, global_score=80)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is False
    assert result.severity == "critical"
    assert "2 habilitation" in result.message

def test_fail_both_expired():
    rule = FormationExpiryRule()
    f = FormationContext(total_employees=10, expired_formations=2, expired_habilitations=3, missing_obligatoires=0, global_score=50)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is False
    assert "2 formation" in result.message
    assert "3 habilitation" in result.message
