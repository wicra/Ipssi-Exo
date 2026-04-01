import { useRef } from 'react'
import { useFormik } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { z } from 'zod'

const evaluationSchema = z.object({
  evaluatorName: z
    .string({ required_error: 'Le nom est obligatoire.' })
    .min(3, 'Le nom doit contenir au moins 3 caractères.'),
  email: z
    .string({ required_error: "L'email est obligatoire." })
    .email('Veuillez saisir un email valide.'),
  rating: z
    .number({
      required_error: 'La note est obligatoire.',
      invalid_type_error: 'La note doit être un nombre.',
    })
    .int('La note doit être un entier.')
    .min(1, 'La note minimum est 1.')
    .max(5, 'La note maximum est 5.'),
  comment: z
    .string()
    .max(200, 'Le commentaire ne peut pas dépasser 200 caractères.')
    .optional()
    .or(z.literal('')),
})

function StarDisplay({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} étoiles sur 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function EvaluationForm({ characterName }) {
  const dialogRef = useRef(null)

  const formik = useFormik({
    initialValues: {
      evaluatorName: '',
      email: '',
      rating: '',
      comment: '',
    },
    validationSchema: toFormikValidationSchema(evaluationSchema),
    onSubmit: (values) => {
      console.log('Évaluation soumise :', values)
      dialogRef.current?.showModal()
    },
  })

  const ratingValue = parseInt(formik.values.rating, 10)

  return (
    <section className="form-section">
      <h2 className="form-section-title">
        Laisser une note sur ce personnage
      </h2>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="form-grid">
          {/* Nom de l'évaluateur */}
          <div className="form-group">
            <label className="form-label" htmlFor="evaluatorName">
              Nom de l'évaluateur <span>*</span>
            </label>
            <input
              id="evaluatorName"
              name="evaluatorName"
              type="text"
              className={`form-input${formik.touched.evaluatorName && formik.errors.evaluatorName ? ' error' : ''}`}
              placeholder="Jean Dupont"
              value={formik.values.evaluatorName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.evaluatorName && formik.errors.evaluatorName && (
              <span className="form-error">⚠ {formik.errors.evaluatorName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input${formik.touched.email && formik.errors.email ? ' error' : ''}`}
              placeholder="exemple@email.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="form-error">⚠ {formik.errors.email}</span>
            )}
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="rating">
              Note (1 à 5) <span>*</span>
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              className={`form-input${formik.touched.rating && formik.errors.rating ? ' error' : ''}`}
              placeholder="Entre 1 et 5"
              value={formik.values.rating}
              onChange={(e) => {
                const val = e.target.value
                formik.setFieldValue('rating', val === '' ? '' : parseInt(val, 10))
              }}
              onBlur={formik.handleBlur}
            />
            {!formik.errors.rating && formik.values.rating !== '' && !isNaN(ratingValue) && (
              <StarDisplay rating={Math.min(5, Math.max(1, ratingValue))} />
            )}
            {formik.touched.rating && formik.errors.rating && (
              <span className="form-error">⚠ {formik.errors.rating}</span>
            )}
          </div>

          {/* Commentaire */}
          <div className="form-group">
            <label className="form-label" htmlFor="comment">
              Commentaire{' '}
              <span style={{ color: '#7a8fa8', fontWeight: 400 }}>(facultatif, max 200 car.)</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              className={`form-textarea${formik.touched.comment && formik.errors.comment ? ' error' : ''}`}
              placeholder="Votre avis sur ce personnage…"
              maxLength={200}
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <span style={{ fontSize: '0.75rem', color: '#7a8fa8', textAlign: 'right' }}>
              {formik.values.comment.length}/200
            </span>
            {formik.touched.comment && formik.errors.comment && (
              <span className="form-error">⚠ {formik.errors.comment}</span>
            )}
          </div>

          {/* Bouton */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Valider l'évaluation
            </button>
          </div>
        </div>
      </form>

      {/* Modale de confirmation */}
      <dialog ref={dialogRef} aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-content">
          <div className="modal-icon">🎉</div>
          <h3 className="modal-title" id="modal-title">Évaluation envoyée !</h3>
          <div className="modal-recap">
            <p className="modal-recap-item">
              <strong>Personnage :</strong> {characterName}
            </p>
            <p className="modal-recap-item">
              <strong>Évaluateur :</strong> {formik.values.evaluatorName}
            </p>
            <p className="modal-recap-item">
              <strong>Email :</strong> {formik.values.email}
            </p>
            <p className="modal-recap-item">
              <strong>Note :</strong>{' '}
              {!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5 && (
                <StarDisplay rating={ratingValue} />
              )}
            </p>
            {formik.values.comment && (
              <p className="modal-recap-item">
                <strong>Commentaire :</strong> {formik.values.comment}
              </p>
            )}
          </div>
          <button
            className="btn-close"
            onClick={() => {
              dialogRef.current?.close()
              formik.resetForm()
            }}
          >
            Fermer
          </button>
        </div>
      </dialog>
    </section>
  )
}
