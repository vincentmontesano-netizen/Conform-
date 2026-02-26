from app.engine.rules.formation_missing import FormationMissingRule
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
    rule = FormationMissingRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_covered():
    rule = FormationMissingRule()
    f = FormationContext(total_employees=10, expired_formations=0, expired_habilitations=0, missing_obligatoires=0, global_score=100)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is True
    assert "100%" in result.message

def test_fail_missing_obligatoires():
    rule = FormationMissingRule()
    f = FormationContext(total_employees=10, expired_formations=0, expired_habilitations=0, missing_obligatoires=5, global_score=60)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is False
    assert result.severity == "critical"
    assert "5 formation" in result.message

def test_fail_single_missing():
    rule = FormationMissingRule()
    f = FormationContext(total_employees=3, expired_formations=0, expired_habilitations=0, missing_obligatoires=1, global_score=85)
    result = rule.evaluate(make_request(formations=f))
    assert result.passed is False
    assert "1 formation" in result.message
