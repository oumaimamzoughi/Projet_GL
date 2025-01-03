const SubjectChoice = require("../models/SubjectChoice.model");
const User = require("../models/User.model");
const PFA = require("../models/PFA.mode");
const Mail = require("../models/email.model");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../services/emailService");
// Create a new subject choice
exports.createSubjectChoice = async (req, res) => {
  try {
    // Generate unique id_chapter for chapters if missing
    if (req.body.chapters) {
      req.body.chapters = req.body.chapters.map((chapter) => {
        if (!chapter.id_chapter) {
          chapter.id_chapter = uuidv4();
        }
        return chapter;
      });
    }

    const newSubjectChoice = new SubjectChoice(req.body);
    await newSubjectChoice.save();

    res.status(201).json(newSubjectChoice);
  } catch (error) {
    console.error("Error creating SubjectChoice:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all subject choices
exports.getAllSubjectChoices = async (req, res) => {
  try {
    const subjectChoices = await SubjectChoice.find();
    res.status(200).json(subjectChoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject choice by name
exports.updateSubjectChoice = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOneAndUpdate(
      { subject_name: req.params.name },
      req.body,
      { new: true }
    );
    if (!subjectChoice) {
      return res.status(404).json({ message: "Subject choice not found" });
    }
    res.status(200).json(subjectChoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject choice by name
exports.deleteSubjectChoice = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOneAndDelete({
      subject_name: req.params.name,
    });
    if (!subjectChoice) {
      return res.status(404).json({ message: "Subject choice not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllStudentChoices = async (req, res) => {
  try {
    const choices = await SubjectChoice.find()
      .populate("student", "firstName lastName ") // Récupère les détails de l'étudiant
      .populate("pfa", "title description") // Récupère les détails du PFA
      .populate("partner", "firstName lastName") // Récupère les détails du partenaire
      .exec();

    res.status(200).json({
      success: true,
      data: choices,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des choix des étudiants:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Erreur serveur. Impossible de récupérer les choix des étudiants.",
    });
  }
};

// Fonction pour affecter un enseignant à un choix d'étudiant
exports.assignTeacherToChoice = async (choice, teacher) => {
  try {
    // Affecter l'enseignant au choix de l'étudiant
    choice.teacher = teacher._id; // Affecter l'ID de l'enseignant au choix
    choice.teacherApproval = true; // Marquer le choix comme approuvé par l'enseignant
    await choice.save(); // Sauvegarder la modification dans la base de données
  } catch (error) {
    console.error("Erreur lors de l'affectation de l'enseignant :", error);
  }
};

// Fonction pour affecter un enseignant à un choix d'étudiant
exports.assignTeacherToChoice = async (choice, teacher) => {
  try {
    // Vérifier si l'étudiant est déjà assigné à un sujet
    const existingAssignment = await SubjectChoice.findOne({
      student: choice.student._id,
      teacherApproval: true,
    });

    if (existingAssignment) {
      console.log(
        `L'étudiant ${choice.student.lastName} est déjà assigné au sujet "${existingAssignment.pfa.title}".`
      );
      return; // Ne pas réaffecter l'étudiant
    }

    // Affecter l'enseignant au choix de l'étudiant
    choice.teacher = teacher._id; // Affecter l'ID de l'enseignant au choix
    choice.teacherApproval = true; // Marquer le choix comme approuvé par l'enseignant
    await choice.save(); // Sauvegarder la modification dans la base de données
  } catch (error) {
    console.error("Erreur lors de l'affectation de l'enseignant :", error);
  }
};

// exports.assignPFA = async (req, res) => {
//   try {
//     const results = [];

//     const subjectChoices = await SubjectChoice.find()
//       .populate({
//         path: 'pfa',
//         populate: { path: 'teacher', model: 'User' },
//       })
//       .populate('student partner');

//     const assignedPFAs = new Set();

//     for (const choice of subjectChoices) {
//       const { student, partner, pfa, teacherApproval } = choice;

//       if (!pfa || assignedPFAs.has(pfa._id.toString())) {
//         continue;
//       }

//       if (partner) {
//         const partnerPFA = await PFA.findOne({ student: partner._id, state: 'affecté' });

//         if (partnerPFA) {
//           await PFA.findByIdAndUpdate(partnerPFA._id, {
//             partner_id: student._id,
//           });

//           results.push({
//             teacher: partnerPFA.teacher
//               ? `${partnerPFA.teacher.firstName} ${partnerPFA.teacher.lastName}`
//               : "Non défini",
//             student: `${student.firstName} ${student.lastName}`,
//             partner: `${partner.firstName} ${partner.lastName}`,
//             subject: partnerPFA.title,
//           });

//           assignedPFAs.add(partnerPFA._id.toString());
//           continue;
//         }
//       }

//       if (teacherApproval || (!partner && pfa.state === 'non affecté')) {
//         await PFA.findByIdAndUpdate(pfa._id, {
//           student: student._id,
//           partner_id: partner?._id || null,
//           state: 'affecté',
//         });

//         results.push({
//          teacher: `${pfa.teacher.firstName} ${pfa.teacher.lastName}`,
//           student: `${student.firstName} ${student.lastName}`,
//           partner: partner ? `${partner.firstName} ${partner.lastName}` : null,
//           subject: pfa.title,
//         });

//         assignedPFAs.add(pfa._id.toString());
//       }
//     }

//     res.status(200).json({
//       message: "Affectation automatique terminée.",
//       results,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'affectation automatique des PFAs :", error);
//     res.status(500).json({
//       error: "Erreur interne du serveur",
//       details: error.message,
//     });
//   }
// };

exports.assignPFA = async (req, res) => {
  try {
    const results = [];
    const subjectChoices = await SubjectChoice.find()
      .populate({
        path: "pfa",
        populate: {
          path: "teacher",
          model: "User",
          select: "firstName lastName", // Inclure ces champs
        },
      })
      .populate("student partner");

    const assignedPFAs = new Set();

    for (const choice of subjectChoices) {
      const { student, partner, pfa, teacherApproval } = choice;

      if (!pfa || assignedPFAs.has(pfa._id.toString())) {
        continue;
      }

      if (partner) {
        const partnerPFA = await PFA.findOne({
          student: partner._id,
          state: "affecté",
        }).populate("teacher");

        if (partnerPFA) {
          await PFA.findByIdAndUpdate(partnerPFA._id, {
            partner_id: student._id,
          });

          results.push({
            teacher: partnerPFA.teacher
              ? `${partnerPFA.teacher.firstName} ${partnerPFA.teacher.lastName}`
              : "Non défini",
            student: `${student.firstName} ${student.lastName}`,
            partner: `${partner.firstName} ${partner.lastName}`,
            subject: partnerPFA.title,
          });

          assignedPFAs.add(partnerPFA._id.toString());
          continue;
        }
      }

      if (teacherApproval || (!partner && pfa.state === "non affecté")) {
        const updatedPFA = await PFA.findByIdAndUpdate(
          pfa._id,
          {
            student: student._id,
            partner_id: partner?._id || null,
            state: "affecté",
          },
          { new: true }
        ).populate("teacher");

        results.push({
          teacher: updatedPFA.teacher
            ? `${updatedPFA.teacher.firstName} ${updatedPFA.teacher.lastName}`
            : "Non défini",
          student: `${student.firstName} ${student.lastName}`,
          partner: partner ? `${partner.firstName} ${partner.lastName}` : null,
          subject: updatedPFA.title,
        });

        assignedPFAs.add(pfa._id.toString());
      }
    }

    res.status(200).json({
      message: "Affectation automatique terminée.",
      results,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation automatique des PFAs :", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
};

// exports.assignSubjectManually = async (req, res) => {
//   try {
//     const { studentId, pfaId, teacherId, partnerId, force } = req.body;

//     // Vérifier si l'étudiant est déjà affecté à un sujet et peupler le sujet
//     const existingChoice = await SubjectChoice.findOne({
//       student: studentId,
//       teacherApproval: false, // On vérifie uniquement les choix non validés par l'enseignant
//     }).populate("pfa");

//     if (existingChoice) {
//       // Si force est vrai, on peut réaffecter le sujet
//       if (force) {
//         // Supprimer l'affectation actuelle de l'étudiant
//         await SubjectChoice.deleteOne({ _id: existingChoice._id });

//         // Trouver un sujet avec une priorité suivante pour l'étudiant
//         const nextSubject = await SubjectChoice.findOne({
//           student: partnerId,
//           teacherApproval: false,
//           priority: { $gt: existingChoice.priority }, // Trouver un sujet avec une priorité plus grande
//         }).populate("pfa");

//         if (!nextSubject) {
//           return res.status(400).json({
//             message: `Aucun sujet disponible avec une priorité supérieure pour le partenaire.`,
//           });
//         }

//         // Affecter le nouveau sujet à l'étudiant
//         const newChoice = new SubjectChoice({
//           student: studentId,
//           pfa: pfaId,
//           teacher: teacherId,
//           teacherApproval: false,
//           priority: nextSubject.priority, // Utiliser la priorité suivante
//           partner: partnerId || null,
//         });

//         await newChoice.save();

//         // Affecter le sujet suivant au partenaire
//         const partnerChoice = new SubjectChoice({
//           student: partnerId,
//           pfa: nextSubject.pfa._id, // Associer le partenaire avec le sujet suivant
//           teacher: teacherId,
//           teacherApproval: false,
//           priority: nextSubject.priority,
//           partner: studentId, // Associe le partenaire à l'étudiant
//         });

//         await partnerChoice.save();

//         return res.status(200).json({
//           message: `Le sujet "${newChoice.pfa.title}" a été affecté à l'étudiant ${studentId} et le sujet suivant a été affecté au partenaire avec succès.`,
//         });

//       } else {
//         // Si force est false, on renvoie une erreur comme précédemment
//         return res.status(400).json({
//           message: `L'étudiant avec l'ID ${studentId} est déjà affecté au sujet "${existingChoice.pfa.title}".`,
//         });
//       }
//     }

//     // Si force n'est pas activé et aucun choix existant, continuer normalement
//     // Vérifier si le partenaire est déjà affecté à un sujet
//     if (partnerId) {
//       const existingPartnerChoice = await SubjectChoice.findOne({
//         student: partnerId,
//         teacherApproval: false,
//       }).populate("pfa");

//       if (existingPartnerChoice) {
//         return res.status(400).json({
//           message: `Le partenaire avec l'ID ${partnerId} est déjà affecté au sujet "${existingPartnerChoice.pfa.title}".`,
//         });
//       }
//     }

//     // Vérifier si le professeur est déjà affecté à un sujet
//     const teacherAssigned = await SubjectChoice.findOne({
//       teacher: teacherId,
//       teacherApproval: false,
//     });

//     if (teacherAssigned) {
//       return res.status(400).json({
//         message: `Le professeur avec l'ID ${teacherId} est déjà affecté à un sujet.`,
//       });
//     }

//     // Si tout est OK, affecter manuellement l'étudiant et son partenaire au sujet
//     const newChoice = new SubjectChoice({
//       student: studentId,
//       pfa: pfaId,
//       teacher: teacherId,
//       teacherApproval: false, // Pour indiquer que ce choix n'a pas encore été validé par l'enseignant
//       priority: 1, // Vous pouvez ajuster la priorité ici si nécessaire
//       partner: partnerId || null, // Si un partenaire est fourni, on l'associe, sinon null
//     });

//     await newChoice.save();

//     // Si un partenaire est fourni, l'affecter également
//     if (partnerId) {
//       const partnerChoice = new SubjectChoice({
//         student: partnerId,
//         pfa: pfaId,
//         teacher: teacherId,
//         teacherApproval: false,
//         priority: 1,
//         partner: studentId, // Associe le partenaire à l'étudiant
//       });

//       await partnerChoice.save();
//     }

//     res.status(200).json({
//       message: `Le sujet "${newChoice.pfa.title}" a été affecté à l'étudiant ${studentId} et son partenaire avec succès.`,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'affectation manuelle :", error);
//     res.status(500).json({
//       message: "Erreur lors de l'affectation manuelle.",
//       error: error.message,
//     });
//   }
// };

exports.assignPFAManually = async (req, res) => {
  try {
    const { studentId, partnerId, teacherId, subjectId } = req.body;

    // Vérifier si l'étudiant est déjà affecté à un autre sujet
    const existingPFA = await PFA.findOne({
      student: studentId,
      state: "affecté",
    });

    if (existingPFA) {
      return res.status(400).json({
        error: "Cet étudiant est déjà affecté à un autre sujet.",
      });
    }

    // Vérifier si le PFA (sujet) existe
    const subject = await PFA.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        error: "Le sujet spécifié n'existe pas.",
      });
    }

    // Vérifier si l'enseignant existe
    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        error: "L'enseignant spécifié n'existe pas ou n'est pas un enseignant.",
      });
    }

    // Affectation manuelle
    const updatedPFA = await PFA.findByIdAndUpdate(
      subjectId,
      {
        student: studentId,
        partner_id: partnerId || null,
        teacher: teacherId,
        state: "affecté",
      },
      { new: true } // Retourner le document mis à jour
    );

    res.status(200).json({
      message: "Affectation manuelle terminée.",
      updatedPFA,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation manuelle:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
};

// exports.assignPFAWithForce = async (req, res) => {
//   try {
//     const { studentId, partnerId, teacherId, subjectId, force } = req.body;

//     // Vérifier si le sujet sélectionné est déjà affecté
//     const existingPFA = await PFA.findOne({ subject: subjectId, state: 'affecté' });

//     if (existingPFA) {
//       // Si le sujet est déjà affecté à un étudiant
//       const oldStudent = existingPFA.student; // L'étudiant déjà affecté au sujet
//       const oldPartner = existingPFA.partner_id; // Le partenaire déjà affecté

//       // Réaffecter l'étudiant et son partenaire à un autre sujet parmi leur liste de choix en respectant la priorité
//       const availableSubjects = await Subject.find({ students: { $in: [oldStudent, oldPartner] } });

//       // Trier les sujets par priorité (assurez-vous d'avoir une propriété 'priority' dans votre modèle Subject)
//       const sortedSubjects = availableSubjects.sort((a, b) => a.priority - b.priority);

//       // Choisir le premier sujet avec la priorité la plus haute
//       const newSubjectForOldStudent = sortedSubjects[0];

//       // Réaffecter l'ancien étudiant et son partenaire
//       await PFA.findByIdAndUpdate(
//         newSubjectForOldStudent._id,
//         {
//           student: oldStudent,
//           partner_id: oldPartner,
//           teacher: teacherId,  // Réaffecter avec le même enseignant
//           state: 'affecté',
//         },
//         { new: true }
//       );

//       // Mettre à jour l'ancien sujet comme non affecté
//       await PFA.findByIdAndUpdate(
//         existingPFA._id,
//         {
//           state: 'non affecté',
//           student: null,
//           partner_id: null,
//         },
//         { new: true }
//       );

//       // Préparer les informations à renvoyer pour les étudiants réaffectés
//       const result = {
//         oldStudent: {
//           studentId: oldStudent,
//           subjectAssigned: newSubjectForOldStudent,
//           message: `L'étudiant ${oldStudent} et son partenaire ${oldPartner} ont été réaffectés à un autre sujet.`,
//         },
//       };

//       // Affecter le sujet sélectionné au nouvel étudiant et son partenaire
//       const newSubject = await PFA.findById(subjectId);
//       if (!newSubject) {
//         return res.status(404).json({
//           error: "Le sujet spécifié n'existe pas.",
//         });
//       }

//       const updatedPFA = await PFA.findByIdAndUpdate(
//         newSubject._id,
//         {
//           student: studentId,
//           partner_id: partnerId || null,
//           teacher: teacherId,
//           state: 'affecté',
//         },
//         { new: true }
//       );

//       // Ajouter les informations du nouvel étudiant dans le résultat
//       result.newStudent = {
//         studentId: studentId,
//         partnerId: partnerId || 'Aucun partenaire',
//         subjectAssigned: newSubject,
//         message: `L'étudiant ${studentId} et son partenaire ${partnerId || 'Aucun partenaire'} ont été affectés au sujet ${newSubject.title}.`,
//       };

//       // Renvoi de la réponse avec les résultats détaillés
//       res.status(200).json({
//         message: "Réaffectation réussie.",
//         result,
//       });

//     } else {
//       // Si le sujet n'est pas déjà affecté, on procède à l'affectation normale
//       const newSubject = await PFA.findById(subjectId);
//       if (!newSubject) {
//         return res.status(404).json({
//           error: "Le sujet spécifié n'existe pas.",
//         });
//       }

//       const updatedPFA = await PFA.findByIdAndUpdate(
//         newSubject._id,
//         {
//           student: studentId,
//           partner_id: partnerId || null,
//           teacher: teacherId,
//           state: 'affecté',
//         },
//         { new: true }
//       );

//       // Réponse d'affectation normale si le sujet n'était pas déjà affecté
//       res.status(200).json({
//         message: "Affectation réussie.",
//         updatedPFA,
//       });
//     }

//   } catch (error) {
//     console.error("Erreur lors de l'affectation de l'étudiant:", error);
//     res.status(500).json({
//       error: "Erreur interne du serveur",
//       details: error.message,
//     });
//   }
// };

exports.assignPFAWithForce = async (req, res) => {
  try {
    const { studentId, partnerId, teacherId, subjectId, force } = req.body;

    // Vérifier si l'étudiant est déjà affecté à un sujet
    const existingPFA = await PFA.findOne({
      student: studentId,
      state: "affecté",
    });

    if (force && existingPFA) {
      // Si force est activé, on annule l'affectation existante et réaffecte l'étudiant

      // Annuler l'affectation du sujet actuel de l'étudiant
      const oldSubject = existingPFA;
      await PFA.findByIdAndUpdate(
        oldSubject._id,
        {
          state: "non affecté",
          student: null,
          partner_id: null,
        },
        { new: true }
      );

      // Vérifier si le sujet sélectionné est déjà affecté
      let newSubject = await PFA.findById(subjectId);
      if (!newSubject) {
        return res.status(404).json({
          error: "Le sujet spécifié n'existe pas.",
        });
      }

      // Si le sujet est déjà affecté, on le réaffecte à un autre étudiant et partenaire
      if (newSubject.state === "affecté") {
        // Récupérer les informations de l'ancien étudiant et partenaire du sujet
        const oldStudent = newSubject.student;
        const oldPartner = newSubject.partner_id;

        // Trouver des sujets disponibles pour réaffecter l'ancien étudiant et partenaire
        const availableSubjects = await PFA.find({
          student: { $nin: [oldStudent, oldPartner] },
          state: "non affecté",
        }).populate("teacher", "firstName lastName");

        // Trier les sujets disponibles par priorité (en supposant que chaque sujet a un champ 'priority')
        const sortedSubjects = availableSubjects.sort(
          (a, b) => a.priority - b.priority
        );

        // Choisir le premier sujet disponible pour réaffecter l'ancien étudiant et partenaire
        const newAssignedSubject = sortedSubjects[0];

        // Réaffecter l'ancien étudiant et partenaire à ce nouveau sujet
        await PFA.findByIdAndUpdate(
          newAssignedSubject._id,
          {
            student: oldStudent,
            partner_id: oldPartner,
            teacher: teacherId,
            state: "affecté",
          },
          { new: true }
        );

        // Mettre à jour l'état du sujet actuel comme non affecté
        await PFA.findByIdAndUpdate(
          newSubject._id,
          {
            state: "non affecté",
            student: null,
            partner_id: null,
          },
          { new: true }
        );

        // Préparer le message pour l'ancien étudiant et son partenaire
        const result = {
          oldStudent: {
            studentId: oldStudent,
            subjectAssigned: newAssignedSubject.title,
            message: `L'étudiant ${oldStudent} et son partenaire ${oldPartner} ont été réaffectés au sujet ${newAssignedSubject.title}.`,
          },
        };

        // Réaffecter le sujet choisi au nouvel étudiant et partenaire
        const updatedPFA = await PFA.findByIdAndUpdate(
          newSubject._id,
          {
            student: studentId,
            partner_id: partnerId || null,
            teacher: teacherId,
            state: "affecté",
          },
          { new: true }
        );

        result.newStudent = {
          studentId: studentId,
          partnerId: partnerId || "Aucun partenaire",
          subjectAssigned: newSubject.title,
          message: `L'étudiant ${studentId} et son partenaire ${
            partnerId || "Aucun partenaire"
          } ont été affectés au sujet ${newSubject.title}.`,
        };

        res.status(200).json({
          message: "Réaffectation réussie.",
          result,
        });
      } else {
        // Si le sujet n'est pas encore affecté, on procède à une nouvelle affectation
        await PFA.findByIdAndUpdate(
          newSubject._id,
          {
            student: studentId,
            partner_id: partnerId || null,
            teacher: teacherId,
            state: "affecté",
          },
          { new: true }
        );

        res.status(200).json({
          message: "Affectation réussie.",
          updatedPFA: newSubject,
        });
      }
    } else if (existingPFA && !force) {
      // Si l'étudiant est déjà affecté et force est false
      return res.status(400).json({
        error:
          "Cet étudiant est déjà affecté à un autre sujet. Utilisez 'force' pour forcer l'affectation.",
      });
    } else {
      // Si l'étudiant n'était pas affecté, on effectue une affectation normale
      const newSubject = await PFA.findById(subjectId);
      if (!newSubject) {
        return res.status(404).json({
          error: "Le sujet spécifié n'existe pas.",
        });
      }

      const updatedPFA = await PFA.findByIdAndUpdate(
        newSubject._id,
        {
          student: studentId,
          partner_id: partnerId || null,
          teacher: teacherId,
          state: "affecté",
        },
        { new: true }
      );

      res.status(200).json({
        message: "Affectation réussie.",
        updatedPFA,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'affectation de l'étudiant:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
};

exports.getFinalPFEAssignments = async (req, res) => {
  try {
    // Récupérer tous les sujets avec 'state' = 'affecté'
    const pfes = await PFA.find({ state: "affecté" })
      .populate("teacher", "firstName lastName")
      .populate("student", "firstName lastName")
      .populate("partner_id", "firstName lastName")
      .exec();

    if (!pfes || pfes.length === 0) {
      return res.status(404).json({ message: "Aucun sujet affecté trouvé." });
    }

    const result = pfes.map((pfe) => ({
      subject: pfe.title,
      teacher: {
        firstName: pfe.teacher.firstName,
        lastName: pfe.teacher.lastName,
      },
      student: {
        firstName: pfe.student.firstName,
        lastName: pfe.student.lastName,
      },
      partner: pfe.partner_id
        ? {
            firstName: pfe.partner_id.firstName,
            lastName: pfe.partner_id.lastName,
          }
        : null,
      state: pfe.state,
    }));

    res.status(200).json({
      message: "Sujets PFE affectés récupérés avec succès.",
      result,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des sujets PFE affectés :",
      error
    );
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
};

exports.sendList = async (req, res) => {
  const recipients = [
    "fitourions@gmail.com",
    "oumaimahrnii@gmail.com",
    "islemhani52@gmail.com",
  ]; // Liste des destinataires

  try {
    // Récupérer la configuration d'envoi
    let mailConfig = await Mail.findOne();

    // Si la configuration n'existe pas, la créer
    if (!mailConfig) {
      mailConfig = new Mail();
      await mailConfig.save();
    }

    const isModified = mailConfig.isModified;
    const subject = isModified
      ? "Liste des sujets PFA mise à jour"
      : "Première liste des sujets PFE publiés";
    const message = isModified
      ? "La liste des sujets PFE a été modifiée. Consultez les nouveaux sujets ici."
      : "Voici la liste des sujets PFE publiés.";

    // Récupérer les sujets publiés
    const publishedPFAs = await PFA.find({ state: "affecté" })
      .populate("teacher", "firstName lastName")
      .populate("student", "firstName lastName")
      .populate("partner_id", "firstName lastName")
      .exec();

    if (!publishedPFAs || publishedPFAs.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet PFA publié à envoyer." });
    }

    // Envoyer l'email aux destinataires
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient,
        subject,
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    // Mettre à jour la configuration d'envoi
    const now = new Date();
    mailConfig.isModified = true; // À partir de la deuxième fois, la liste est marquée comme modifiée
    mailConfig.lastSentDate = now;
    await mailConfig.save();

    res.status(200).json({
      message: "Liste des sujets PFA envoyée avec succès.",
      sentAt: now,
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de la liste des sujets PFA :",
      error.message
    );
    res
      .status(500)
      .json({ error: "Erreur interne du serveur", details: error.message });
  }
};
