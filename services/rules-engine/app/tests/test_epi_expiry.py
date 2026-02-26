from app.engine.rules.epi_expiry import EpiExpiryRule
from app.models.request import EvaluationRequest, CompanyContext, EpiContext

def make_request(epi=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=10,
            has_physical_site=True,
            sector="btp",
        ),
        risks=[],
        actions=[],
        epi=epi,
    )

def test_pass_no_epi_data():
    rule = EpiExpiryRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_valid():
    rule = EpiExpiryRule()
    epi = EpiContext(total_items=20, expired_items=0, items_without_controle=0, employees_without_epi=0)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is True
    assert "20 EPI" in result.message

def test_fail_expired_items():
    rule = EpiExpiryRule()
    epi = EpiContext(total_items=20, expired_items=3, items_without_controle=0, employees_without_epi=0)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is False
    assert result.severity == "critical"
    assert "3 EPI expire" in result.message

def test_fail_without_controle():
    rule = EpiExpiryRule()
    epi = EpiContext(total_items=20, expired_items=0, items_without_controle=5, employees_without_epi=0)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is False
    assert result.severity == "warning"
    assert "5 EPI sans controle" in result.message

def test_fail_both_expired_and_no_controle():
    rule = EpiExpiryRule()
    epi = EpiContext(total_items=20, expired_items=2, items_without_controle=3, employees_without_epi=0)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is False
    assert result.severity == "critical"
    assert "2 EPI expire" in result.message
    assert "3 EPI sans controle" in result.message
