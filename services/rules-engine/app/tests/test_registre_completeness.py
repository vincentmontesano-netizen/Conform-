from app.engine.rules.registre_completeness import RegistreCompletenessRule
from app.models.request import EvaluationRequest, CompanyContext, RegistreContext

def make_request(registres=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=10,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=[],
        actions=[],
        registres=registres,
    )

def test_pass_no_registre_data():
    rule = RegistreCompletenessRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_present():
    rule = RegistreCompletenessRule()
    r = RegistreContext(
        required_types=["rup", "accidents", "dangers_graves", "securite"],
        existing_types=["rup", "accidents", "dangers_graves", "securite"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is True
    assert "4 registres" in result.message

def test_fail_missing_registres():
    rule = RegistreCompletenessRule()
    r = RegistreContext(
        required_types=["rup", "accidents", "dangers_graves", "securite"],
        existing_types=["rup", "securite"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is False
    assert result.severity == "warning"
    assert "2 registre" in result.message
    assert "accidents" in result.message
    assert "dangers_graves" in result.message

def test_fail_single_missing():
    rule = RegistreCompletenessRule()
    r = RegistreContext(
        required_types=["rup", "accidents"],
        existing_types=["rup"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is False
    assert "1 registre" in result.message

def test_pass_extra_registres():
    rule = RegistreCompletenessRule()
    r = RegistreContext(
        required_types=["rup"],
        existing_types=["rup", "accidents", "securite"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is True
