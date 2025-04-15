// Classe de base (Component)
class InternshipValidator {
    validate(internship) {
        return { isValid: true, errors: [] };
    }
}

// BasicValidator (ConcreteComponent)
class BasicValidator extends InternshipValidator {
    validate(internship) {
        return { isValid: true, errors: [] };
    }
}

// ValidationDecorator (Decorator)
class ValidationDecorator extends InternshipValidator {
    constructor(validator) {
        super();
        this.validator = validator;
    }

    validate(internship) {
        return this.validator.validate(internship);
    }
}

// TitleValidationDecorator (ConcreteDecorator A)
class TitleValidationDecorator extends ValidationDecorator {
    validate(internship) {
        const result = super.validate(internship);

        if (!internship.title || internship.title.trim() === "") {
            result.isValid = false;
            result.errors.push("Title is required.");
        }

        return result;
    }
}

// DocumentValidationDecorator (ConcreteDecorator B)
class DocumentValidationDecorator extends ValidationDecorator {
    validate(internship) {
        const result = super.validate(internship);

        // Vérifier si les documents sont présents et que la longueur n'est pas égale à 0
        if (!internship.documents || internship.documents.length === 0) {
            result.isValid = false;
            result.errors.push("Documents are missing.");
        }

        return result;
    }
}



// Export des classes
module.exports = {
    InternshipValidator,
    BasicValidator,
    TitleValidationDecorator,
    DocumentValidationDecorator,
};