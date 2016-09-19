﻿using LightInject;
using NUnit.Framework;
using Umbraco.Core.DependencyInjection;
using Umbraco.Web.Routing;

namespace Umbraco.Tests.DependencyInjection
{
    [TestFixture]
    public class TempTests
    {
        //[Test]
        public void Test()
        {
            var container = new ServiceContainer();
            container.ConfigureUmbracoCore();
            UrlProviderCollectionBuilder.Register(container)
                .Append<DefaultUrlProvider>();
            var col = container.GetInstance<UrlProviderCollection>();
        }
    }
}