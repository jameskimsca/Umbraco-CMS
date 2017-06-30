using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Models.Membership;

namespace Umbraco.Web.Models.ContentEditing
{
    [DataContract(Name = "userGroup", Namespace = "")]
    public class UserGroupSave : EntityBasic, IValidatableObject
    {
        /// <summary>
        /// The action to perform when saving this user group
        /// </summary>
        /// <remarks>
        /// If either of the Publish actions are specified an exception will be thrown.
        /// </remarks>
        [DataMember(Name = "action", IsRequired = true)]
        [Required]
        public ContentSaveAction Action { get; set; }
        
        [DataMember(Name = "alias", IsRequired = true)]
        [Required]
        public override string Alias { get; set; }
        
        [DataMember(Name = "sections")]
        public IEnumerable<string> Sections { get; set; }

        [DataMember(Name = "users")]
        public IEnumerable<int> Users { get; set; }

        [DataMember(Name = "startContentId")]
        public int StartContentId { get; set; }

        [DataMember(Name = "startMediaId")]
        public int StartMediaId { get; set; }

        /// <summary>
        /// The list of letters (permission codes) to assign as the default for the user group
        /// </summary>
        [DataMember(Name = "permissions")]
        public IEnumerable<string> Permissions { get; set; }

        /// <summary>
        /// The real persisted user group
        /// </summary>
        [IgnoreDataMember]
        internal IUserGroup PersistedUserGroup { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Permissions.Any(x => x.IsNullOrWhiteSpace()))
            {
                yield return new ValidationResult("A permission value cannot be null or empty", new[] { "Permissions" });
            }
        }
    }
}