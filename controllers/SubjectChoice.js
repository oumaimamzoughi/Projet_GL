const SubjectChoice = require('../models/SubjectChoice.model');
const User = require('../models/User.model');
const PFA = require('../models/PFA.mode');
const { v4: uuidv4 } = require('uuid');
// Create a new subject choice
exports.createSubjectChoice = async (req, res) => {
  try {
    // Generate unique id_chapter for chapters if missing
    if (req.body.chapters) {
      req.body.chapters = req.body.chapters.map(chapter => {
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
    const subjectChoice = await SubjectChoice.findOneAndUpdate({ subject_name: req.params.name }, req.body, { new: true });
    if (!subjectChoice) {
      return res.status(404).json({ message: 'Subject choice not found' });
    }
    res.status(200).json(subjectChoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject choice by name
exports.deleteSubjectChoice = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOneAndDelete({ subject_name: req.params.name });
    if (!subjectChoice) {
      return res.status(404).json({ message: 'Subject choice not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllStudentChoices = async (req, res) => {
  try {
    const choices = await SubjectChoice.find()
      .populate('student', 'firstName lastName ') // Récupère les détails de l'étudiant
      .populate('pfa', 'title description') // Récupère les détails du PFA
      .populate('partner', 'firstName lastName') // Récupère les détails du partenaire
      .exec();

    res.status(200).json({
      success: true,
      data: choices,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des choix des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur. Impossible de récupérer les choix des étudiants.',
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
}

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
        path: 'pfa',
        populate: { path: 'teacher', model: 'User' },
      })
      .populate('student partner');

    const assignedPFAs = new Set();

    for (const choice of subjectChoices) {
      const { student, partner, pfa, teacherApproval } = choice;

      if (!pfa || assignedPFAs.has(pfa._id.toString())) {
        continue;
      }

      if (partner) {
        const partnerPFA = await PFA.findOne({ student: partner._id, state: 'affecté' }).populate('teacher');

        if (partnerPFA) {
          await PFA.findByIdAndUpdate(partnerPFA._id, {
            partner_id: student._id,
          });

          results.push({
            teacher: partnerPFA.teacher
              ? `${partnerPFA.teacher.firstName} ${partnerPFA.teacher.lastName}`
              : "Non défini",
            student:` ${student.firstName} ${student.lastName}`,
            partner: `${partner.firstName} ${partner.lastName}`,
            subject: partnerPFA.title,
          });

          assignedPFAs.add(partnerPFA._id.toString());
          continue;
        }
      }

      if (teacherApproval || (!partner && pfa.state === 'non affecté')) {
        await PFA.findByIdAndUpdate(pfa._id, {
          student: student._id,
          partner_id: partner?._id || null,
          state: 'affecté',
        });

        results.push({
          teacher: pfa.teacher
            ? `${pfa.teacher.firstName} ${pfa.teacher.lastName}`
            : "Non défini",
          student: `${student.firstName} ${student.lastName}`,
          partner: partner ?` ${partner.firstName} ${partner.lastName}` : null,
          subject: pfa.title,
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


exports.assignSubjectManually = async (req, res) => {
  try {
    const { studentId, pfaId, teacherId, partnerId, force } = req.body;

    // Vérifier si l'étudiant est déjà affecté à un sujet et peupler le sujet
    const existingChoice = await SubjectChoice.findOne({
      student: studentId,
      teacherApproval: false, // On vérifie uniquement les choix non validés par l'enseignant
    }).populate("pfa");

    if (existingChoice) {
      // Si force est vrai, on peut réaffecter le sujet
      if (force) {
        // Supprimer l'affectation actuelle de l'étudiant
        await SubjectChoice.deleteOne({ _id: existingChoice._id });

        // Trouver un sujet avec une priorité suivante pour l'étudiant
        const nextSubject = await SubjectChoice.findOne({
          student: partnerId,
          teacherApproval: false,
          priority: { $gt: existingChoice.priority }, // Trouver un sujet avec une priorité plus grande
        }).populate("pfa");

        if (!nextSubject) {
          return res.status(400).json({
            message: `Aucun sujet disponible avec une priorité supérieure pour le partenaire.`,
          });
        }

        // Affecter le nouveau sujet à l'étudiant
        const newChoice = new SubjectChoice({
          student: studentId,
          pfa: pfaId,
          teacher: teacherId,
          teacherApproval: false,
          priority: nextSubject.priority, // Utiliser la priorité suivante
          partner: partnerId || null,
        });

        await newChoice.save();

        // Affecter le sujet suivant au partenaire
        const partnerChoice = new SubjectChoice({
          student: partnerId,
          pfa: nextSubject.pfa._id, // Associer le partenaire avec le sujet suivant
          teacher: teacherId,
          teacherApproval: false,
          priority: nextSubject.priority,
          partner: studentId, // Associe le partenaire à l'étudiant
        });

        await partnerChoice.save();

        return res.status(200).json({
          message: `Le sujet "${newChoice.pfa.title}" a été affecté à l'étudiant ${studentId} et le sujet suivant a été affecté au partenaire avec succès.`,
        });

      } else {
        // Si force est false, on renvoie une erreur comme précédemment
        return res.status(400).json({
          message: `L'étudiant avec l'ID ${studentId} est déjà affecté au sujet "${existingChoice.pfa.title}".`,
        });
      }
    }

    // Si force n'est pas activé et aucun choix existant, continuer normalement
    // Vérifier si le partenaire est déjà affecté à un sujet
    if (partnerId) {
      const existingPartnerChoice = await SubjectChoice.findOne({
        student: partnerId,
        teacherApproval: false,
      }).populate("pfa");

      if (existingPartnerChoice) {
        return res.status(400).json({
          message: `Le partenaire avec l'ID ${partnerId} est déjà affecté au sujet "${existingPartnerChoice.pfa.title}".`,
        });
      }
    }

    // Vérifier si le professeur est déjà affecté à un sujet
    const teacherAssigned = await SubjectChoice.findOne({
      teacher: teacherId,
      teacherApproval: false,
    });

    if (teacherAssigned) {
      return res.status(400).json({
        message: `Le professeur avec l'ID ${teacherId} est déjà affecté à un sujet.`,
      });
    }

    // Si tout est OK, affecter manuellement l'étudiant et son partenaire au sujet
    const newChoice = new SubjectChoice({
      student: studentId,
      pfa: pfaId,
      teacher: teacherId,
      teacherApproval: false, // Pour indiquer que ce choix n'a pas encore été validé par l'enseignant
      priority: 1, // Vous pouvez ajuster la priorité ici si nécessaire
      partner: partnerId || null, // Si un partenaire est fourni, on l'associe, sinon null
    });

    await newChoice.save();

    // Si un partenaire est fourni, l'affecter également
    if (partnerId) {
      const partnerChoice = new SubjectChoice({
        student: partnerId,
        pfa: pfaId,
        teacher: teacherId,
        teacherApproval: false,
        priority: 1,
        partner: studentId, // Associe le partenaire à l'étudiant
      });

      await partnerChoice.save();
    }

    res.status(200).json({
      message: `Le sujet "${newChoice.pfa.title}" a été affecté à l'étudiant ${studentId} et son partenaire avec succès.`,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation manuelle :", error);
    res.status(500).json({
      message: "Erreur lors de l'affectation manuelle.",
      error: error.message,
    });
  }
};
