// Classe de base (Component) coriger 
class InternshipValidator {
    validate(data) {
        throw new Error("Method 'validate()' must be implemented.");
    }
}


// BasicValidator (ConcreteComponent) --> implementation de base de la methode validate 
//pour BasicValidator 
class BasicValidator extends InternshipValidator {
    validate(data) {
        const errors = [];
        
        // Validation structurelle minimale
        if (!data || typeof data !== 'object') {
            return { isValid: false, errors: ["Format de données invalide"] };
        }

        if (typeof data.title !== 'string') {
            errors.push("Le titre doit être une chaîne");
        }

        if (!Array.isArray(data.documents)) {
            errors.push("Les documents doivent être un tableau");
        }

        return { isValid: errors.length === 0, errors };
    }
}

// ValidationDecorator (Decorator)
class ValidationDecorator extends InternshipValidator {
    constructor(wrappedValidator) {  // c'est le validateur enveloppé (celui qu'on décore) 
        super();
        this.wrappedValidator = wrappedValidator;
    }

    validate(data) {
        return this.wrappedValidator.validate(data);
    }
}

// TitleValidationDecorator (ConcreteDecorator A)
class TitleValidationDecorator extends ValidationDecorator {
    validate(data) {
        // 1. Appel au validateur ENVELOPPÉ
        const result = super.validate(data);

         // 2. Ajout de nouvelles règles
        if (!data.title?.trim()) {
            result.isValid = false;
            result.errors.push("Titre requis");
        } else if (data.title.length < 5) {
            result.isValid = false;
            result.errors.push("Titre trop court (5 caractères minimum)");
        }


        return result;
    }
}

// DocumentValidationDecorator (ConcreteDecorator B)
class DocumentValidationDecorator extends ValidationDecorator {
    validate(data) {
        const result = super.validate(data);

        // Vérifier que la longueur n'est pas égale à 0
        if (data.documents.length === 0) {
            result.isValid = false;
            result.errors.push("Au moins un document est requis.");
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